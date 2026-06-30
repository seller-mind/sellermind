/**
 * SM Free Etsy SEO Checker — /api/etsy-audit POST handler.
 *
 * Pipeline:
 *   1. Parse body, validate URL (SSRF gate in lib/etsy-fetcher.ts)
 *   2. Three-layer rate limit (Upstash, fail-closed)
 *   3. Cache lookup (6h TTL keyed on canonical URL)
 *   4. Etsy fetch (5s timeout, 500KB cap, ≤3 redirects re-validated)
 *   5. Cheerio parse
 *   6. DeepSeek call (30s timeout, json_object response_format)
 *   7. Sanitize + clamp response → AuditResult
 *   8. Write cache, return success
 *
 * On any upstream failure after rate-limit check: ROLLBACK ip+global counters.
 *
 * Security headers: no-store + CORS thesellermind.com whitelist.
 */

import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  validateEtsyUrl,
  fetchEtsyListing,
  parseEtsyHtml,
} from "@/lib/etsy-fetcher";
import {
  checkEtsyRateLimit,
  extractClientIp,
  rateLimitBody,
  rollbackForIp,
  readUrlCache,
  writeUrlCache,
} from "@/lib/etsy-rate-limit";
import {
  ETSY_AUDIT_SYSTEM_PROMPT,
  buildEtsyUserPrompt,
  sanitizeAuditResult,
} from "@/lib/etsy-prompt";
import type { AuditApiResponse, AuditResult } from "@/lib/etsy-types";

// Force Node.js runtime — Cheerio uses Node APIs (PR Edge limit is 1MB
// gzipped, but we're at ~600KB with cheerio + react-pdf isolated to /pdf route).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_TIMEOUT_MS = 6_000; // Groq Llama 4 Scout P50 ~2-4s; hobby 10s budget, Etsy fetch ~1-3s, leave 1s buffer
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const ALLOWED_ORIGINS = new Set([
  "https://thesellermind.com",
  "https://www.thesellermind.com",
]);

// ============ Helpers ============

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  if (ALLOWED_ORIGINS.has(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "600",
      Vary: "Origin",
    };
  }
  return { Vary: "Origin" };
}

function jsonResponse(
  body: AuditApiResponse,
  status: number,
  req: Request,
  extraHeaders: Record<string, string> = {}
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      ...corsHeaders(req),
      ...extraHeaders,
    },
  });
}

// Anonymised log line (no listing title, no IP, no description).
function logAudit(payload: {
  status: number;
  cached: boolean;
  parse_quality?: string;
  fetch_status?: number;
  total_score?: number;
  grade?: string;
  cost_usd?: number;
  latency_ms: number;
  rate_limited?: string;
}) {
  try {
    console.log(
      JSON.stringify({
        etsy_audit_log: true,
        ts: Date.now(),
        ...payload,
      })
    );
  } catch {
    /* never throw from a logger */
  }
}

// ============ Handlers ============

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req),
  });
}

export async function GET(req: Request) {
  // Anti-enumeration / debug surface — return 405.
  return jsonResponse(
    {
      success: false,
      error: { code: "INVALID_JSON", message: "Method not allowed. Use POST." },
    },
    405,
    req,
    { Allow: "POST, OPTIONS" }
  );
}

export async function POST(req: Request) {
  const t0 = Date.now();
  let body: { url?: unknown };

  // ---- 1. body parse ----
  try {
    body = (await req.json()) as { url?: unknown };
  } catch {
    logAudit({ status: 400, cached: false, latency_ms: Date.now() - t0 });
    return jsonResponse(
      { success: false, error: { code: "INVALID_JSON", message: "Body must be valid JSON." } },
      400,
      req
    );
  }

  // ---- 2. URL validation (SSRF gate) ----
  const validation = validateEtsyUrl(body.url);
  if (!validation.ok || !validation.canonical || !validation.listing_id) {
    logAudit({ status: 400, cached: false, latency_ms: Date.now() - t0 });
    return jsonResponse(
      {
        success: false,
        error: {
          code: "INVALID_URL",
          message: validation.reason || "Please paste a full Etsy listing URL.",
        },
      },
      400,
      req
    );
  }
  const canonical = validation.canonical;
  const listingId = validation.listing_id;

  // ---- 3. rate limit ----
  const ip = extractClientIp(req);
  const rl = await checkEtsyRateLimit(ip);
  if (!rl.allowed) {
    logAudit({
      status: 429,
      cached: false,
      latency_ms: Date.now() - t0,
      rate_limited: rl.layer,
    });
    const errBody = rateLimitBody(rl);
    return jsonResponse(errBody, rl.layer === "window" ? 429 : 429, req, {
      ...(rl.retryAfterSeconds
        ? { "Retry-After": String(rl.retryAfterSeconds) }
        : {}),
    });
  }

  // ---- 4. cache lookup ----
  let cachedHit = false;
  try {
    const cached = await readUrlCache(canonical);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as AuditResult;
        parsed.meta.cached = true;
        cachedHit = true;
        // Refund the counters — cache hit shouldn't count against the user.
        await rollbackForIp(ip);
        logAudit({
          status: 200,
          cached: true,
          parse_quality: parsed.meta.parse_quality,
          total_score: parsed.total_score,
          grade: parsed.overall_grade,
          latency_ms: Date.now() - t0,
        });
        return jsonResponse({ success: true, data: parsed }, 200, req);
      } catch {
        // bad cache value — fall through to live fetch
      }
    }
  } catch {
    /* cache read failure — fall through */
  }
  void cachedHit;

  // ---- 5. fetch listing ----
  const fetchResult = await fetchEtsyListing(canonical);
  if (!fetchResult.ok || !fetchResult.body) {
    await rollbackForIp(ip);
    const isNotFound = fetchResult.status === 404 || fetchResult.status === 410;
    logAudit({
      status: isNotFound ? 404 : 502,
      cached: false,
      fetch_status: fetchResult.status,
      latency_ms: Date.now() - t0,
    });
    const _host = req.headers.get("host") || "";
    const _isPreview = _host.endsWith(".vercel.app");
    const _dbgSuffix = _isPreview
      ? ` [DBG status=${fetchResult.status} err=${fetchResult.error}]`
      : "";
    return jsonResponse(
      {
        success: false,
        error: {
          code: isNotFound ? "ETSY_NOT_FOUND" : "ETSY_FETCH_FAILED",
          message: isNotFound
            ? `Etsy returned 404 for this listing. Make sure the URL is current and public.${_dbgSuffix}`
            : `Couldn't read this listing from Etsy right now (they may be busy). Try again in ~30s, or paste your title/tags/description into our other free tool /tools/etsy-seo-tool.${_dbgSuffix}`,
          ...(_isPreview
            ? {
                debug: {
                  fetch_status: fetchResult.status,
                  fetch_error: fetchResult.error,
                  fetch_url: canonical,
                },
              }
            : {}),
        },
      },
      isNotFound ? 404 : 502,
      req
    );
  }

  // ---- 6. parse ----
  let snapshot;
  try {
    snapshot = parseEtsyHtml(fetchResult.body, canonical, listingId);
  } catch (err) {
    await rollbackForIp(ip);
    console.error("[etsy-audit] parse error:", err instanceof Error ? err.message : err);
    logAudit({
      status: 502,
      cached: false,
      fetch_status: fetchResult.status,
      latency_ms: Date.now() - t0,
    });
    return jsonResponse(
      {
        success: false,
        error: {
          code: "ETSY_FETCH_FAILED",
          message: "We couldn't parse this listing's page. Try again — Etsy occasionally rotates page layout.",
        },
      },
      502,
      req
    );
  }

  // ---- 7. DeepSeek ----
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    await rollbackForIp(ip);
    logAudit({ status: 503, cached: false, latency_ms: Date.now() - t0 });
    return jsonResponse(
      {
        success: false,
        error: {
          code: "AI_SERVICE_UNAVAILABLE",
          message: "AI backend is offline right now. Try again in a moment.",
        },
      },
      503,
      req
    );
  }

  const groq = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

  let analysis: AuditResult | null = null;
  try {
    const completion = await groq.chat.completions.create(
      {
        model: MODEL,
        temperature: 0.3,
        max_tokens: 1_100,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: ETSY_AUDIT_SYSTEM_PROMPT },
          { role: "user", content: buildEtsyUserPrompt(snapshot) },
        ],
      },
      { signal: AbortSignal.timeout(GROQ_TIMEOUT_MS) }
    );

    const content = completion.choices?.[0]?.message?.content || "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Groq returned non-JSON");
    }
    analysis = sanitizeAuditResult(parsed, snapshot);
    if (!analysis) throw new Error("Groq response failed schema validation");
  } catch (err) {
    await rollbackForIp(ip);
    console.error(
      "[etsy-audit] Groq failure:",
      err instanceof Error ? err.message : "unknown"
    );
    logAudit({
      status: 502,
      cached: false,
      parse_quality: snapshot.parse_quality,
      latency_ms: Date.now() - t0,
    });
    return jsonResponse(
      {
        success: false,
        error: {
          code: "AI_RESPONSE_INVALID",
          message: "AI returned an unexpected response. Please try again in 30s.",
        },
      },
      502,
      req
    );
  }

  // ---- 8. cache write + return ----
  try {
    await writeUrlCache(canonical, JSON.stringify(analysis));
  } catch {
    /* swallow — caching is best-effort */
  }

  // Rough Groq cost estimate for telemetry only (not user-facing).
  // Llama 4 Scout: $0.11/1M input + $0.34/1M output. ~1k in + 0.8k out per audit.
  const approxCost = 0.00038;
  logAudit({
    status: 200,
    cached: false,
    parse_quality: snapshot.parse_quality,
    fetch_status: fetchResult.status,
    total_score: analysis.total_score,
    grade: analysis.overall_grade,
    cost_usd: approxCost,
    latency_ms: Date.now() - t0,
  });

  return jsonResponse({ success: true, data: analysis }, 200, req);
}
