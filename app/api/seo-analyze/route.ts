import { NextResponse } from "next/server";
import OpenAI from "openai";
import { applyPreUsageChecks, buildLimitExceededResponse } from "@/lib/security";
import { checkAndIncrementUsage } from "@/lib/usage";

// Runtime declarations (also addresses BUG-19).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Etsy SEO Analyzer — DeepSeek-backed implementation (2026-06-14, Y2).
 *
 * Replaces the original rule-based scorer (and the 503 stub from Y).
 * Front-end contract (app/tools/etsy-seo-tool/page.tsx) is unchanged:
 *   request:  { title, tags, description }
 *     - tags is a newline-separated string from the textarea
 *   response: { success: true, data: {
 *     score: number,                          // 0-100
 *     strengths: string[],                    // 2-6 short bullets
 *     weaknesses: SEORecommendation[],        // 2-6 items
 *     additionalTags: string[],               // 5-10 extra tag suggestions
 *     overallFeedback: string                 // 1-3 sentence summary
 *   } }
 *
 * SEORecommendation = { type: "success"|"warning"|"improvement", message, impact: "High"|"Medium"|"Low" }
 *
 * On any DeepSeek failure the route returns 503 + AI_SERVICE_UNAVAILABLE,
 * which the front-end handles via local demo fallback.
 */

const DEEPSEEK_TIMEOUT_MS = 30_000;
const MODEL = "deepseek-chat";

const SYSTEM_PROMPT = `You are a senior Etsy SEO consultant. You audit Etsy listings (title + 13 tags + description) and return a structured optimization report.

Scoring rubric (sum to a 0-100 score):
- Title length: 120-140 chars is best (+25). 100-119 (+18). 80-99 (+12). <80 (+5).
- Title keyword stacking: front-loaded buyer keyword in first 30 chars (+10), uses pipe/comma separators (+5).
- Tags coverage: count of tags supplied / 13. >=13 (+15), 10-12 (+10), 5-9 (+6), <5 (+2).
- Tag quality: phrases of 2-3 words, mostly under 20 chars, mix of broad and long-tail (+15).
- Description length: >= 160 chars and starts with a buyer-intent hook (+15). >=80 chars (+8). Empty/very short (+0).
- Cross-channel signals: title keywords also appear in tags and description (+10).
- Penalties: ALL CAPS title (-5), keyword stuffing in title (-5), missing description (-5).

Output JSON shape (STRICT, no markdown, no commentary):
{
  "score": <integer 0-100>,
  "strengths": ["<short positive bullet>", ...],            // 2-6 entries
  "weaknesses": [
    {
      "type": "success" | "warning" | "improvement",        // most should be "warning" or "improvement"
      "message": "<concrete actionable issue>",
      "impact": "High" | "Medium" | "Low"
    },
    ...
  ],                                                        // 2-6 entries
  "additionalTags": ["<lowercase phrase, <=20 chars>", ...], // 5-10 entries, distinct from existing tags
  "overallFeedback": "<1-3 sentence plain-English summary tying score to top fix>"
}

Constraints:
- Return ONLY that JSON. No prose outside it.
- Strengths and weaknesses must be specific to the input (not generic platitudes).
- Each additionalTag must be lowercase, 2-3 words, <= 20 chars, no commas, no special characters.
- Score must be an integer.`;

interface SEORequest {
  title?: string;
  tags?: string;
  description?: string;
  email?: string;
}

interface SEORecommendation {
  type: "success" | "warning" | "improvement";
  message: string;
  impact: "High" | "Medium" | "Low";
}

interface SEOAnalysis {
  score: number;
  strengths: string[];
  weaknesses: SEORecommendation[];
  additionalTags: string[];
  overallFeedback: string;
}

function serviceUnavailable() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "AI_SERVICE_UNAVAILABLE",
        message: "AI service temporarily unavailable, please try again in a moment",
      },
    },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

function buildUserPrompt(body: SEORequest): string {
  const title = (body.title || "").trim();
  const tags = (body.tags || "").trim();
  const description = (body.description || "").trim();

  const tagList = tags
    .split(/\r?\n|,/)
    .map((t) => t.trim())
    .filter(Boolean);

  return `Audit this Etsy listing and return the JSON report described in the system prompt.

TITLE (${title.length} chars):
${title || "(empty)"}

TAGS (${tagList.length} entries):
${tagList.length ? tagList.map((t, i) => `${i + 1}. ${t}`).join("\n") : "(empty)"}

DESCRIPTION (${description.length} chars):
${description || "(empty)"}

Return strict JSON exactly matching the schema in the system prompt.`;
}

function isImpact(v: unknown): v is SEORecommendation["impact"] {
  return v === "High" || v === "Medium" || v === "Low";
}

function isRecType(v: unknown): v is SEORecommendation["type"] {
  return v === "success" || v === "warning" || v === "improvement";
}

function sanitizeAnalysis(raw: unknown): SEOAnalysis | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const scoreNum = typeof r.score === "number" ? r.score : Number(r.score);
  if (!Number.isFinite(scoreNum)) return null;
  const score = Math.max(0, Math.min(100, Math.round(scoreNum)));

  const strengthsArr = Array.isArray(r.strengths) ? r.strengths : [];
  const strengths = strengthsArr
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim())
    .slice(0, 8);

  const weaknessesArr = Array.isArray(r.weaknesses) ? r.weaknesses : [];
  const weaknesses: SEORecommendation[] = [];
  for (const item of weaknessesArr) {
    if (!item || typeof item !== "object") continue;
    const w = item as Record<string, unknown>;
    if (typeof w.message !== "string" || !w.message.trim()) continue;
    weaknesses.push({
      type: isRecType(w.type) ? w.type : "improvement",
      message: w.message.trim(),
      impact: isImpact(w.impact) ? w.impact : "Medium",
    });
    if (weaknesses.length >= 8) break;
  }

  const tagsArr = Array.isArray(r.additionalTags) ? r.additionalTags : [];
  const additionalTags = tagsArr
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .map((t) => t.trim().toLowerCase().slice(0, 20))
    .slice(0, 12);

  const overallFeedback =
    typeof r.overallFeedback === "string" && r.overallFeedback.trim()
      ? r.overallFeedback.trim()
      : "";

  if (strengths.length === 0 && weaknesses.length === 0 && !overallFeedback) {
    return null;
  }

  return { score, strengths, weaknesses, additionalTags, overallFeedback };
}

export async function POST(request: Request) {
  // Security gate — abuse detection, per-IP rate limit, global daily cap
  const preCheck = await applyPreUsageChecks(request);
  if (preCheck) return preCheck;

  let body: SEORequest;
  try {
    body = (await request.json()) as SEORequest;
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  if (!body?.title?.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_INPUT", message: "title is required." },
      },
      { status: 400 }
    );
  }

  // Per-user freemium quota (3/month default)
  const email = (body.email as string) || "";
  const { allowed, isSubscribed } = await checkAndIncrementUsage(email);
  if (!allowed) return buildLimitExceededResponse(isSubscribed);

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return serviceUnavailable();
  }

  const deepseek = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });

  try {
    const completion = await deepseek.chat.completions.create(
      {
        model: MODEL,
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(body) },
        ],
      },
      { signal: AbortSignal.timeout(DEEPSEEK_TIMEOUT_MS) }
    );

    const content = completion.choices?.[0]?.message?.content;
    if (!content) return serviceUnavailable();

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return serviceUnavailable();
    }

    const analysis = sanitizeAnalysis(parsed);
    if (!analysis) return serviceUnavailable();

    return NextResponse.json(
      { success: true, data: analysis },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[seo-analyze] DeepSeek call failed:", err);
    return serviceUnavailable();
  }
}
