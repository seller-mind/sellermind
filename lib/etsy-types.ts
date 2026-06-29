/**
 * SM Free Etsy SEO Checker — shared types.
 *
 * Used by:
 *   - lib/etsy-fetcher.ts        (HTML parse output)
 *   - lib/etsy-prompt.ts         (DeepSeek schema)
 *   - app/api/etsy-audit/route.ts
 *   - app/api/etsy-audit/pdf/route.ts
 *   - app/free-etsy-seo-checker/* (client)
 *
 * Hard contract — DO NOT widen without bumping FE renderer.
 */

export type ImpactLevel = "High" | "Medium" | "Low";
export type Grade = "A" | "B" | "C" | "D";

export interface EtsyListingSnapshot {
  /** canonical https://www.etsy.com/listing/{id} (already SSRF-validated) */
  url: string;
  listing_id: string;
  /** parsed listing title (HTML-escaped at render time, NOT here) */
  title: string;
  /** parsed tags / keywords (best-effort from JSON-LD or meta) */
  tags: string[];
  /** parsed description (truncated to 2_000 chars before LLM) */
  description: string;
  /** count of <img> in product gallery (0 when unknown) */
  image_count: number;
  /** % of product images with non-empty alt (0..1, NaN-safe) */
  alt_coverage: number;
  /** parse confidence — used to decide fallback */
  parse_quality: "high" | "medium" | "low";
}

export interface DimensionScore {
  score: number;          // 0..25 clamp
  honest_take: string;    // 2-3 sentences
  next_step: string;      // <= 20 words actionable
}

export interface Priority {
  issue: string;
  fix: string;
  impact: ImpactLevel;
}

export interface AuditResult {
  total_score: number;          // 0..100
  overall_grade: Grade;         // derived from total_score
  one_brutal_line: string;      // <= 25 words
  dimensions: {
    title: DimensionScore;
    tags: DimensionScore;
    description: DimensionScore;
    images_alt: DimensionScore;
  };
  top_3_priorities: Priority[];   // length = 3
  title_before_after: {
    current: string;
    improved: string;
  };
  /** sneak in some non-PII telemetry for the client */
  meta: {
    listing_id: string;
    parsed_at: string;            // ISO
    parse_quality: EtsyListingSnapshot["parse_quality"];
    cached: boolean;
  };
}

export interface AuditErrorBody {
  success: false;
  error: {
    code:
      | "INVALID_JSON"
      | "INVALID_URL"
      | "RATE_LIMIT_EXCEEDED"
      | "DAILY_QUOTA_EXCEEDED"
      | "ETSY_FETCH_FAILED"
      | "ETSY_NOT_FOUND"
      | "AI_SERVICE_UNAVAILABLE"
      | "AI_RESPONSE_INVALID"
      | "INTERNAL_ERROR";
    message: string;
    retryAfterSeconds?: number;
    resetAt?: string;
  };
}

export interface AuditSuccessBody {
  success: true;
  data: AuditResult;
}

export type AuditApiResponse = AuditSuccessBody | AuditErrorBody;
