/**
 * SM Free Etsy SEO Checker — three-layer rate limit + URL cache.
 *
 * Backend: Upstash Redis REST API (D2 default — pay-as-you-go).
 *   - 10000 commands/day free tier covers W1-W8 by 100x margin.
 *   - REST API is HTTPS, no SDK required, no Node deps.
 *
 * Layers (defence-in-depth — red-team #6 race condition + #2 budget drain):
 *   1. Per-IP 30s window — anti-burst (Lua-style atomic SET-NX-EX)
 *   2. Per-IP daily cap = 5 audits/day
 *   3. Global daily cap = 65 audits/day (caps DeepSeek cost at <$0.20/day)
 *
 * Plus URL-hash cache (6h TTL) — saves Etsy ToS reputation + DeepSeek spend.
 *
 * Failure mode: FAIL-CLOSED. If Upstash REST is unreachable we DENY the
 * request (vs. fail-open for global-quota.ts on the legacy supabase quota).
 * Reasoning: this tool is a public unauthenticated endpoint sitting on top
 * of a $0.20/day budget — degraded service is preferable to budget drain.
 *
 * IP handling: hashed (SHA-256, first 12 hex) before use as KV key. Prevents
 * the KV from doubling as a "who-audited-what" reverse index. #129 / GDPR.
 */

import { createHash } from "crypto";

// ============ Config ============

export const ETSY_RL_PER_IP_WINDOW_SEC = 30;
export const ETSY_RL_PER_IP_DAILY_CAP = 5;
export const ETSY_RL_GLOBAL_DAILY_CAP = 65;
export const ETSY_URL_CACHE_TTL_SEC = 6 * 3600;

// KV prefix isolates this tool's keys from any other product on the same
// Upstash database (Validator / PG / future tools).
const KEY_PREFIX = "sm_etsy:";

// ============ Types ============

export interface RateLimitDecision {
  allowed: boolean;
  layer?: "window" | "ip_daily" | "global_daily";
  retryAfterSeconds?: number;
  resetAt?: string;
}

interface UpstashPipeResult<T = unknown> {
  result: T;
}

// ============ Upstash REST helpers ============

function upstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/**
 * Call Upstash REST API. Single command form: ["INCR", "key"].
 * Returns null on any error (caller MUST treat null as fail-closed).
 */
async function upstashCmd(cmd: (string | number)[]): Promise<unknown | null> {
  if (!upstashConfigured()) return null;
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cmd),
      signal: AbortSignal.timeout(2_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: unknown; error?: string };
    if (data.error) return null;
    return data.result ?? null;
  } catch {
    return null;
  }
}

/**
 * Pipeline multiple commands in a single round-trip. Each entry is a single
 * command array. Returns null on transport error.
 */
async function upstashPipeline(
  cmds: (string | number)[][]
): Promise<unknown[] | null> {
  if (!upstashConfigured()) return null;
  const url = process.env.UPSTASH_REDIS_REST_URL!.replace(/\/$/, "") + "/pipeline";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cmds),
      signal: AbortSignal.timeout(2_500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as UpstashPipeResult[];
    if (!Array.isArray(data)) return null;
    return data.map((d) => d.result);
  } catch {
    return null;
  }
}

// ============ Key builders ============

function dateKey(): string {
  // YYYY-MM-DD in UTC — consistent across regions.
  return new Date().toISOString().slice(0, 10);
}

function hashIp(ip: string): string {
  return createHash("sha256")
    .update(ip + ":sm_etsy_seed_v1")
    .digest("hex")
    .slice(0, 12);
}

export function ipWindowKey(ip: string): string {
  return `${KEY_PREFIX}rl:${hashIp(ip)}`;
}

export function ipDailyKey(ip: string): string {
  return `${KEY_PREFIX}ipd:${hashIp(ip)}:${dateKey()}`;
}

export function globalDailyKey(): string {
  return `${KEY_PREFIX}global:${dateKey()}`;
}

export function urlCacheKey(canonicalUrl: string): string {
  const h = createHash("sha256").update(canonicalUrl).digest("hex").slice(0, 24);
  return `${KEY_PREFIX}cache:${h}`;
}

// ============ Public API ============

/**
 * Check + increment the three rate-limit layers. Atomic via Upstash pipeline.
 * FAIL-CLOSED on Upstash error.
 */
export async function checkEtsyRateLimit(ip: string): Promise<RateLimitDecision> {
  if (!upstashConfigured()) {
    return {
      allowed: false,
      layer: "global_daily",
      retryAfterSeconds: 60,
      resetAt: getNextMidnightISO(),
    };
  }

  const wKey = ipWindowKey(ip);
  const iKey = ipDailyKey(ip);
  const gKey = globalDailyKey();

  // Pipeline:
  //  1) SET wKey 1 NX EX 30  -> "OK" if first hit in window, null otherwise
  //  2) INCR iKey
  //  3) EXPIRE iKey 86400 NX (only set TTL on first use)
  //  4) INCR gKey
  //  5) EXPIRE gKey 86400 NX
  const results = await upstashPipeline([
    ["SET", wKey, "1", "NX", "EX", String(ETSY_RL_PER_IP_WINDOW_SEC)],
    ["INCR", iKey],
    ["EXPIRE", iKey, "86400", "NX"],
    ["INCR", gKey],
    ["EXPIRE", gKey, "86400", "NX"],
  ]);

  if (!results || results.length < 5) {
    return {
      allowed: false,
      layer: "global_daily",
      retryAfterSeconds: 60,
      resetAt: getNextMidnightISO(),
    };
  }

  const [windowSet, ipCountRaw, , globalCountRaw] = results;
  const ipCount = numberOr(ipCountRaw, Infinity);
  const globalCount = numberOr(globalCountRaw, Infinity);

  // Window layer — if SET NX failed (returned null), this is a burst.
  if (windowSet === null) {
    // Rollback the counters we just incremented.
    await rollbackCounters(iKey, gKey);
    return {
      allowed: false,
      layer: "window",
      retryAfterSeconds: ETSY_RL_PER_IP_WINDOW_SEC,
    };
  }

  // IP daily layer.
  if (ipCount > ETSY_RL_PER_IP_DAILY_CAP) {
    await rollbackCounters(iKey, gKey);
    return {
      allowed: false,
      layer: "ip_daily",
      resetAt: getNextMidnightISO(),
    };
  }

  // Global daily layer.
  if (globalCount > ETSY_RL_GLOBAL_DAILY_CAP) {
    await rollbackCounters(iKey, gKey);
    return {
      allowed: false,
      layer: "global_daily",
      resetAt: getNextMidnightISO(),
    };
  }

  return { allowed: true };
}

/**
 * Roll back the IP-daily + global-daily counters (DECR). Called when:
 *   - upstream call failed (DeepSeek error / Etsy fetch fail) — don't charge user
 *   - a later layer in checkEtsyRateLimit rejected the request
 *
 * Best-effort; swallowed errors. Counters are tolerant of drift.
 */
export async function rollbackCounters(
  iKey?: string,
  gKey?: string
): Promise<void> {
  const cmds: (string | number)[][] = [];
  if (iKey) cmds.push(["DECR", iKey]);
  if (gKey) cmds.push(["DECR", gKey]);
  if (cmds.length === 0) return;
  await upstashPipeline(cmds);
}

/** Convenience wrapper for the route handler. */
export async function rollbackForIp(ip: string): Promise<void> {
  await rollbackCounters(ipDailyKey(ip), globalDailyKey());
}

// ============ URL cache ============

export async function readUrlCache(canonicalUrl: string): Promise<string | null> {
  const v = await upstashCmd(["GET", urlCacheKey(canonicalUrl)]);
  return typeof v === "string" ? v : null;
}

export async function writeUrlCache(
  canonicalUrl: string,
  value: string
): Promise<void> {
  if (!upstashConfigured()) return;
  await upstashCmd([
    "SET",
    urlCacheKey(canonicalUrl),
    value,
    "EX",
    String(ETSY_URL_CACHE_TTL_SEC),
  ]);
}

// ============ Helpers ============

function numberOr(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function getNextMidnightISO(): string {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.toISOString();
}

/** Extract a single client IP for rate-limit keying. */
export function extractClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || "unknown";
}

// ============ Friendly error bodies ============

export function rateLimitBody(decision: RateLimitDecision): {
  success: false;
  error: {
    code: "RATE_LIMIT_EXCEEDED" | "DAILY_QUOTA_EXCEEDED";
    message: string;
    retryAfterSeconds?: number;
    resetAt?: string;
  };
} {
  if (decision.layer === "window") {
    return {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message:
          "Slow down — please wait ~30 seconds between audits. (Free indie tool, single-AI-budget.) — Haimo",
        retryAfterSeconds: decision.retryAfterSeconds,
      },
    };
  }
  if (decision.layer === "ip_daily") {
    return {
      success: false,
      error: {
        code: "DAILY_QUOTA_EXCEEDED",
        message:
          "You've used today's free audits (5/day). Comes back tomorrow — or if you want to audit your full store, try TheSellerMind (14-day free trial). — Haimo",
        resetAt: decision.resetAt,
      },
    };
  }
  return {
    success: false,
    error: {
      code: "DAILY_QUOTA_EXCEEDED",
      message:
        "Daily free quota for the whole site reached. We cap AI cost at $0.20/day. Try again tomorrow. — Haimo",
      resetAt: decision.resetAt,
    },
  };
}
