/**
 * SM Free Etsy SEO Checker — /api/etsy-audit/pdf POST handler.
 *
 * Accepts an AuditResult in the body (just-validated from /api/etsy-audit)
 * and renders a downloadable PDF using @react-pdf/renderer.
 *
 * Design choice: rather than re-deriving the audit (would double-charge
 * DeepSeek), we take the audit JSON the client already has. Mitigations:
 *   - body schema strictly enforced (only the fields PDF needs)
 *   - filename derived from score+date only (no PII)
 *   - per-IP burst limit (same Upstash window) — no daily cap because
 *     this is just rendering, no AI cost
 *   - body size cap 16KB (audit results are <4KB) — anti-bomb
 *
 * Runtime: nodejs (react-pdf ships ~800KB gzipped — Vercel Edge 1MB limit
 * is too tight given v8 isolate startup). Run on Node serverless instead.
 */

import { NextResponse } from "next/server";
import {
  checkEtsyRateLimit,
  extractClientIp,
  rateLimitBody,
} from "@/lib/etsy-rate-limit";
import type { AuditResult } from "@/lib/etsy-types";
import { sanitizeAuditResult } from "@/lib/etsy-prompt";
import { renderAuditPdf } from "./pdf-render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;

const ALLOWED_ORIGINS = new Set([
  "https://thesellermind.com",
  "https://www.thesellermind.com",
]);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  if (ALLOWED_ORIGINS.has(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
  }
  return { Vary: "Origin" };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req: Request) {
  // Body size cap (anti-bomb).
  const cl = Number(req.headers.get("content-length") || "0");
  if (cl > MAX_BODY_BYTES) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Payload too large." } },
      { status: 413, headers: corsHeaders(req) }
    );
  }

  // Rate limit — share the same window with the audit endpoint to prevent
  // attackers from using PDF as a free burst channel.
  const ip = extractClientIp(req);
  const rl = await checkEtsyRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(rateLimitBody(rl), {
      status: 429,
      headers: { "Cache-Control": "no-store", ...corsHeaders(req) },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Body must be valid JSON." } },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  // Validate the audit payload — same schema enforcer guards against XSS
  // (escapes & clamps strings used in PDF).
  const audit = sanitizeAuditResult(
    (body as { audit?: unknown })?.audit,
    {
      url: "",
      listing_id: ((body as { audit?: { meta?: { listing_id?: string } } })?.audit?.meta?.listing_id) || "unknown",
      title:
        ((body as { audit?: { title_before_after?: { current?: string } } })?.audit?.title_before_after?.current) ||
        "",
      tags: [],
      description: "",
      image_count: 0,
      alt_coverage: 0,
      parse_quality:
        ((body as { audit?: { meta?: { parse_quality?: AuditResult["meta"]["parse_quality"] } } })?.audit?.meta?.parse_quality) ||
        "medium",
    }
  );
  if (!audit) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Audit payload failed validation." } },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  // Render PDF.
  let pdfBuf: Uint8Array;
  try {
    pdfBuf = await renderAuditPdf(audit);
  } catch (err) {
    console.error("[etsy-audit/pdf] render error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "PDF render failed. Try again." } },
      { status: 500, headers: corsHeaders(req) }
    );
  }

  const date = new Date().toISOString().slice(0, 10);
  const filename = `sellermind_etsy_audit_${audit.total_score}_${date}.pdf`;

  return new NextResponse(pdfBuf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      ...corsHeaders(req),
    },
  });
}
