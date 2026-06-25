import { NextResponse } from "next/server";
import OpenAI from "openai";
import { applyPreUsageChecks, buildLimitExceededResponse } from "@/lib/security";
import { checkAndIncrementUsage } from "@/lib/usage";

// Runtime declarations (also addresses BUG-19).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Etsy Review Response — DeepSeek-backed implementation (2026-06-14, Y2).
 *
 * Replaces the original template-only handler (and the 503 stub from Y).
 * Front-end contract (app/tools/etsy-review-response/page.tsx) is unchanged:
 *   request:  { reviewType, reviewContent, responseTone }
 *     - reviewType: "1" .. "5" (string of star count)
 *     - responseTone: "professional" | "friendly" | "casual" | ""
 *   response: { success: true, data: { response: string } }
 *
 * On any DeepSeek failure the route returns 503 + AI_SERVICE_UNAVAILABLE,
 * which the front-end falls back to a local demo reply.
 */

const DEEPSEEK_TIMEOUT_MS = 30_000;
const MODEL = "deepseek-chat";

const SYSTEM_PROMPT = `You are an experienced Etsy seller and customer-service writer. You craft public review responses that protect the shop's reputation and feel personal, never scripted.

Inputs you receive:
- reviewType: "1".."5" — number of stars the buyer left.
- reviewContent: the buyer's text (may be empty for star-only reviews).
- responseTone: "professional" | "friendly" | "casual" | "" (empty means choose the most appropriate tone given the star rating).

Rules for the reply you write:
- 4-5 stars: thank the buyer warmly, mention something specific from their review when possible, end with a soft invitation to come back / share photos / follow the shop.
- 3 stars: thank them for the honest feedback, briefly acknowledge what went well, name a specific improvement you can promise, invite them to message you so you can make it right.
- 1-2 stars: do NOT argue. Apologize sincerely for their experience, take responsibility without making excuses, name a concrete next step (replacement / refund / direct contact), keep it short, never blame the buyer.
- Match the requested tone:
   * professional: polite, polished, complete sentences, no exclamation marks, no slang.
   * friendly: warm, first-person, occasional exclamation, light positivity.
   * casual: conversational, contractions OK, can use 1 emoji max.
   * empty: pick whichever fits the star rating best.
- Never invent specific details (do not promise free shipping, discount codes, or names you weren't told).
- Length: 2-5 sentences. No headers, no bullet points.

OUTPUT FORMAT - return STRICT JSON only, no markdown, no commentary:
{
  "response": "<the reply, plain text only>"
}

Only that single key. The value must be a non-empty string.`;

interface ReviewRequest {
  reviewType?: string;
  reviewContent?: string;
  responseTone?: string;
  email?: string;
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

function buildUserPrompt(body: ReviewRequest): string {
  const reviewType = (body.reviewType || "").trim();
  const reviewContent = (body.reviewContent || "").trim();
  const responseTone = (body.responseTone || "").trim();

  return `Write an Etsy review reply for the following:

- Star rating: ${reviewType || "(not specified)"}
- Buyer review text: ${reviewContent || "(empty — star-only review)"}
- Requested tone: ${responseTone || "(choose based on star rating)"}

Return strict JSON exactly matching the schema in the system prompt.`;
}

function sanitizeResponse(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { response?: unknown };
  if (typeof r.response !== "string") return null;
  const trimmed = r.response.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  // Security gate — abuse detection, per-IP rate limit, global daily cap
  const preCheck = await applyPreUsageChecks(request);
  if (preCheck) return preCheck;

  let body: ReviewRequest;
  try {
    body = (await request.json()) as ReviewRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  if (!body?.reviewType?.toString().trim()) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_INPUT", message: "reviewType is required." },
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
        temperature: 0.6,
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

    const response = sanitizeResponse(parsed);
    if (!response) return serviceUnavailable();

    return NextResponse.json(
      { success: true, data: { response } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[review-response] DeepSeek call failed:", err);
    return serviceUnavailable();
  }
}
