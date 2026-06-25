/**
 * Unified security gate for SellerMind AI routes.
 * Applied BEFORE checkAndIncrementUsage(email) in every API route that hits DeepSeek.
 *
 * Defense layers (in order, cheapest first):
 *   1. Abuse detection — block known bot User-Agents and empty UA
 *   2. Per-IP rate limit (in-memory, 10 req/min) — defends single instance
 *   3. Global daily cap (Supabase-backed) — last line: caps total DeepSeek spend
 *      Falls back to in-memory counter if Supabase table not yet provisioned.
 *
 * After this gate passes, the route still calls checkAndIncrementUsage(email)
 * which enforces the per-user freemium quota (3/month default).
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "./supabase";

// ----- Tunables (env-overridable) -----
const RATE_LIMIT_PER_MIN = Number(process.env.SECURITY_RATE_LIMIT_PER_MIN) || 10;
const GLOBAL_DAILY_CAP = Number(process.env.SECURITY_GLOBAL_DAILY_CAP) || 1000;

// ----- In-memory state (per Vercel function instance) -----
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
let globalDailyCounter: { date: string; count: number } = { date: "", count: 0 };

// ----- Abuse heuristics -----
const BLOCKED_UA_PATTERNS: RegExp[] = [
  /python-requests/i,
  /curl\//i,
  /wget/i,
  /go-http-client/i,
  /headlesschrome/i,
  /phantomjs/i,
  /scrapy/i,
  /^bot/i,
  /(crawler|spider|scraper)\b/i,
  /libwww-perl/i,
  /httpclient/i,
  /okhttp/i,
];

export interface SecurityCheckResult {
  blocked: NextResponse | null;
  remaining?: number;
}

function detectAbuse(req: Request): { abuse: boolean; reason?: string } {
  const ua = req.headers.get("user-agent") || "";
  if (!ua) return { abuse: true, reason: "Missing User-Agent" };
  for (const p of BLOCKED_UA_PATTERNS) {
    if (p.test(ua)) return { abuse: true, reason: "Automated client blocked" };
  }
  return { abuse: false };
}

function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
    return { allowed: true, remaining: RATE_LIMIT_PER_MIN - 1, resetIn: 60 };
  }
  if (limit.count >= RATE_LIMIT_PER_MIN) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((limit.resetTime - now) / 1000),
    };
  }
  limit.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_PER_MIN - limit.count,
    resetIn: Math.ceil((limit.resetTime - now) / 1000),
  };
}

async function checkGlobalDailyCap(): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const today = new Date().toISOString().slice(0, 10);
  if (globalDailyCounter.date !== today) {
    globalDailyCounter = { date: today, count: 0 };
  }
  globalDailyCounter.count++;

  // Best-effort Supabase persistence. If the table doesn't exist yet
  // (migration not applied), we silently fall back to in-memory only.
  try {
    const { data, error } = await supabaseAdmin
      .from("sellermind_global_usage")
      .select("count")
      .eq("day", today)
      .maybeSingle();

    if (!error && data) {
      const dbCount = (data.count as number) || 0;
      // Increment in DB
      await supabaseAdmin
        .from("sellermind_global_usage")
        .upsert(
          { day: today, count: dbCount + 1 },
          { onConflict: "day" }
        );
      if (dbCount + 1 > GLOBAL_DAILY_CAP) {
        return { allowed: false, remaining: 0 };
      }
      return { allowed: true, remaining: GLOBAL_DAILY_CAP - (dbCount + 1) };
    }
    if (!error && !data) {
      // First call of the day — insert row
      await supabaseAdmin
        .from("sellermind_global_usage")
        .upsert({ day: today, count: 1 }, { onConflict: "day" });
      return { allowed: true, remaining: GLOBAL_DAILY_CAP - 1 };
    }
  } catch {
    // Supabase unreachable or table missing — degrade to in-memory cap
  }

  if (globalDailyCounter.count > GLOBAL_DAILY_CAP) {
    return { allowed: false, remaining: 0 };
  }
  return {
    allowed: true,
    remaining: GLOBAL_DAILY_CAP - globalDailyCounter.count,
  };
}

/**
 * Pre-usage security gate. Call at the top of any AI route, BEFORE
 * checkAndIncrementUsage(email). Returns null if all checks pass; otherwise
 * returns a NextResponse the caller must return immediately.
 */
export async function applyPreUsageChecks(
  req: Request
): Promise<NextResponse | null> {
  // 1. Abuse detection (cheapest first, no I/O)
  const abuse = detectAbuse(req);
  if (abuse.abuse) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: abuse.reason || "Request blocked.",
        },
      },
      { status: 403 }
    );
  }

  // 2. Per-IP rate limit (in-memory)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Too many requests. Please wait ${rl.resetIn} seconds.`,
          retry_after_seconds: rl.resetIn,
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.resetIn),
          "X-RateLimit-Limit": String(RATE_LIMIT_PER_MIN),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rl.resetIn),
        },
      }
    );
  }

  // 3. Global daily cap (Supabase-persisted, last line of defense
  //    against catastrophic DeepSeek balance drain)
  const gcap = await checkGlobalDailyCap();
  if (!gcap.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVICE_THROTTLED",
          message:
            "We've hit today's service capacity to protect availability. " +
            "Please try again tomorrow.",
        },
      },
      { status: 503, headers: { "Retry-After": "3600" } }
    );
  }

  return null;
}

/**
 * Standard freemium-exceeded response for routes that call
 * checkAndIncrementUsage(email) directly.
 */
export function buildLimitExceededResponse(
  isSubscribed: boolean
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: isSubscribed ? "SUBSCRIPTION_EXPIRED" : "LIMIT_EXCEEDED",
        message: isSubscribed
          ? "Your subscription has expired. Please renew to continue."
          : "You've used your 3 free uses this month. Upgrade to Pro for unlimited access.",
        upgradeUrl: "/pricing",
      },
    },
    { status: 403 }
  );
}
