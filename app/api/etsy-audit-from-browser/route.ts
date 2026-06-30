/**
 * SM Free Etsy SEO Checker — /api/etsy-audit-from-browser POST handler.
 *
 * Receives listing data extracted client-side (by sm-bookmarklet.js running
 * in the user's own browser on a public Etsy listing page). Skips fetch+parse
 * because Etsy uses DataDome SaaS anti-bot which blocks all cloud IDC egress.
 *
 * Pipeline:
 *   1. Parse body, validate snapshot shape (whitelist + clamp)
 *   2. Three-layer rate limit (shared Upstash counters with /api/etsy-audit)
 *   3. Groq call (6s timeout, json_object response_format)
 *   4. Sanitize + clamp response → AuditResult
 *   5. Return success (NO cache write — per ToS we do not persist listing content)
 *
 * Security headers: no-store + CORS whitelist (etsy.com + thesellermind.com).
 */

import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  checkEtsyRateLimit,
  extractClientIp,
  rateLimitBody,
  rollbackForIp,
} from "@/lib/etsy-rate-limit";
import {
  ETSY_AUDIT_SYSTEM_PROMPT,
  buildEtsyUserPrompt,
  sanitizeAuditResult,
} from "@/lib/etsy-prompt";
import type {
  AuditApiResponse,
  AuditResult,
  EtsyListingSnapshot,
} from "@/lib/etsy-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_TIMEOUT_MS = 6_000;
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// CORS: bookmarklet runs on etsy.com → must allow that origin.
// Also allow thesellermind.com for self-test / fallback retry from the report page.
const ALLOWED_ORIGINS = new Set([
  "https://www.etsy.com",
  "https://etsy.com",
  "https://thesellermind.com",
  "https://www.thesellermind.com",
]);

// Preview CORS — allow vercel.app preview origins so we can test before merge.
function isPreviewOrigin(origin: string): boolean {
  return /^https:\/\/sellermind-[a-z0-9-]+-sellermind-s-projects\.vercel\.app$/.test(
    origin
  );
}

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  if (ALLOWED_ORIGINS.has(origin) || isPreviewOrigin(origin)) {
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
  extra: Record<string, string> = {}
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      ...corsHeaders(req),
      ...extra,
    },
  });
}

// Validate + clamp incoming payload to EtsyListingSnapshot
type RawPayload = {
  listing_id?: unknown;
  url?: unknown;
  title?: unknown;
  description?: unknown;
  tags?: unknown;
  image_count?: unknown;
  alt_coverage?: unknown;
  parse_quality?: unknown;
};

function buildSnapshot(payload: RawPayload | null | undefined): EtsyListingSnapshot | null {
  if (!payload || typeof payload !== "object") return null;
  const idStr = String(payload.listing_id ?? "").replace(/\D/g, "");
  if (!idStr || idStr.length < 5 || idStr.length > 20) return null;

  const title = String(payload.title ?? "").replace(/\s+/g, " ").trim().slice(0, 500);
  if (!title) return null;

  let tags: string[] = [];
  if (Array.isArray(payload.tags)) {
    const seen = new Set<string>();
    for (const t of payload.tags) {
      if (typeof t !== "string") continue;
      const clean = t.trim().slice(0, 60);
      if (!clean) continue;
      const k = clean.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      tags.push(clean);
      if (tags.length >= 13) break;
    }
  }

  const description = String(payload.description ?? "").slice(0, 5000);
  const image_count = Math.max(0, Math.min(30, Math.floor(Number(payload.image_count) || 0)));

  let alt_coverage = Number(payload.alt_coverage);
  if (!Number.isFinite(alt_coverage)) alt_coverage = 0;
  alt_coverage = Math.max(0, Math.min(1, alt_coverage));

  const pqRaw = String(payload.parse_quality ?? "medium");
  const parse_quality: "high" | "medium" | "low" =
    pqRaw === "high" || pqRaw === "low" ? pqRaw : "medium";

  return {
    url: `https://www.etsy.com/listing/${idStr}`,
    listing_id: idStr,
    title,
    tags,
    description,
    image_count,
    alt_coverage,
    parse_quality,
  };
}

function logAudit(payload: {
  status: number;
  parse_quality?: string;
  total_score?: number;
  grade?: string;
  latency_ms: number;
  rate_limited?: string;
  listing_id?: string;
}) {
  try {
    console.log(
      JSON.stringify({
        etsy_audit_browser_log: true,
        ts: Date.now(),
        ...payload,
      })
    );
  } catch {
    /* never throw from a logger */
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req: Request) {
  return jsonResponse(
    { success: false, error: { code: "INVALID_JSON", message: "Method not allowed. Use POST." } },
    405,
    req,
    { Allow: "POST, OPTIONS" }
  );
}

export async function POST(req: Request) {
  const t0 = Date.now();
  let body: RawPayload;
  try {
    body = (await req.json()) as RawPayload;
  } catch {
    logAudit({ status: 400, latency_ms: Date.now() - t0 });
    return jsonResponse(
      { success: false, error: { code: "INVALID_JSON", message: "Body must be valid JSON." } },
      400,
      req
    );
  }

  const snapshot = buildSnapshot(body);
  if (!snapshot) {
    logAudit({ status: 400, latency_ms: Date.now() - t0 });
    return jsonResponse(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Missing required listing fields (listing_id + title). Re-install the bookmarklet if your version is old.",
        },
      },
      400,
      req
    );
  }

  // Shared rate limiter with /api/etsy-audit (same Upstash keys)
  const ip = extractClientIp(req);
  const rl = await checkEtsyRateLimit(ip);
  if (!rl.allowed) {
    logAudit({
      status: 429,
      latency_ms: Date.now() - t0,
      rate_limited: rl.layer,
      listing_id: snapshot.listing_id,
    });
    return jsonResponse(
      rateLimitBody(rl),
      429,
      req,
      rl.retryAfterSeconds ? { "Retry-After": String(rl.retryAfterSeconds) } : {}
    );
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    await rollbackForIp(ip);
    logAudit({ status: 503, latency_ms: Date.now() - t0 });
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

  const groq = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

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
      "[etsy-audit-from-browser] Groq failure:",
      err instanceof Error ? err.message : "unknown"
    );
    logAudit({
      status: 502,
      latency_ms: Date.now() - t0,
      parse_quality: snapshot.parse_quality,
      listing_id: snapshot.listing_id,
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

  // NOTE: deliberately NOT writing to cache — per ToS we do not persist
  // listing content. Each audit runs fresh; the user's own bookmarklet
  // provides whatever caching they want client-side.

  logAudit({
    status: 200,
    parse_quality: snapshot.parse_quality,
    total_score: analysis.total_score,
    grade: analysis.overall_grade,
    latency_ms: Date.now() - t0,
    listing_id: snapshot.listing_id,
  });

  return jsonResponse({ success: true, data: analysis }, 200, req);
}
