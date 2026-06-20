import { NextResponse } from "next/server";
import OpenAI from "openai";

// Runtime declarations (also addresses BUG-19).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Holiday Marketing Kit — DeepSeek-backed implementation (2026-06-14, Y2).
 *
 * Replaces the original template-only handler (and the 503 stub from Y).
 * Front-end contract (app/tools/etsy-holiday-marketing/page.tsx) is unchanged:
 *   request:  { holiday, productDescription, targetAudience }
 *   response: { success: true, data: {
 *     titles: string[],          // 5 holiday-themed Etsy titles
 *     tags: string[],            // 13 holiday-tuned Etsy tags (<= 20 chars each)
 *     emailTemplate: string,     // ready-to-send buyer email (4-8 lines)
 *     timingTips: string         // 1-3 sentence timing/strategy tip
 *   } }
 *
 * On any DeepSeek failure the route returns 503 + AI_SERVICE_UNAVAILABLE,
 * which the front-end falls back gracefully.
 */

const DEEPSEEK_TIMEOUT_MS = 30_000;
const MODEL = "deepseek-chat";

const SYSTEM_PROMPT = `You are an expert Etsy holiday-marketing strategist. You help small handmade shops turn seasonal moments (Christmas, Valentine's Day, Mother's Day, Father's Day, Halloween, etc.) into top-converting listings.

Your task: given a holiday, product description, and target audience, produce a complete marketing kit.

Constraints for each field:
- "titles": exactly 5 Etsy listing titles, each 70-140 chars, holiday-themed, front-loaded keyword in first 30 chars, natural human phrasing, no emoji spam. Pipe ( | ) or comma separators.
- "tags": exactly 13 lowercase Etsy tag phrases, each <= 20 chars (Etsy hard limit), 2-3 words preferred, mix of buyer-intent ("<holiday> gift"), audience ("gift for mom"), style/material, and long-tail occasion phrases. No duplicates.
- "emailTemplate": a single string containing a buyer-facing email (subject is allowed inline as "Subject: ..."), 4-8 lines, with a clear holiday hook, value prop, urgency (e.g. shipping deadline), and a soft CTA. Use \n for line breaks. Keep it warm and personal, not corporate.
- "timingTips": 1-3 sentences advising when to launch, what shipping cutoff to communicate, and one pro tip for the holiday's specific buying-cycle.

OUTPUT FORMAT - return STRICT JSON only, no markdown, no commentary:
{
  "titles": ["...", "...", "...", "...", "..."],
  "tags": ["...", "...", "...", "...", "...", "...", "...", "...", "...", "...", "...", "...", "..."],
  "emailTemplate": "...",
  "timingTips": "..."
}

Only those four keys. No extras.`;

interface HolidayRequest {
  holiday?: string;
  productDescription?: string;
  targetAudience?: string;
}

interface MarketingKit {
  titles: string[];
  tags: string[];
  emailTemplate: string;
  timingTips: string;
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

function buildUserPrompt(body: HolidayRequest): string {
  const holiday = (body.holiday || "").trim();
  const productDescription = (body.productDescription || "").trim();
  const targetAudience = (body.targetAudience || "").trim();

  return `Build a holiday-marketing kit for the following:

- Holiday: ${holiday || "(not specified)"}
- Product description: ${productDescription || "(not specified)"}
- Target audience: ${targetAudience || "(not specified)"}

Return strict JSON exactly matching the schema in the system prompt.`;
}

function sanitizeKit(raw: unknown): MarketingKit | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const titlesArr = Array.isArray(r.titles) ? r.titles : [];
  const titles = titlesArr
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .map((t) => t.trim())
    .slice(0, 5);

  const tagsArr = Array.isArray(r.tags) ? r.tags : [];
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const t of tagsArr) {
    if (typeof t !== "string") continue;
    const cleaned = t.trim().toLowerCase().slice(0, 20);
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    tags.push(cleaned);
    if (tags.length >= 13) break;
  }

  const emailTemplate =
    typeof r.emailTemplate === "string" && r.emailTemplate.trim()
      ? r.emailTemplate.trim()
      : "";
  const timingTips =
    typeof r.timingTips === "string" && r.timingTips.trim() ? r.timingTips.trim() : "";

  if (titles.length === 0 || tags.length === 0 || !emailTemplate) {
    return null;
  }

  return { titles, tags, emailTemplate, timingTips };
}

export async function POST(request: Request) {
  let body: HolidayRequest;
  try {
    body = (await request.json()) as HolidayRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  if (!body?.holiday?.trim() || !body?.productDescription?.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_INPUT", message: "holiday and productDescription are required." },
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return serviceUnavailable();
  }

  const deepseek = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });

  try {
    const completion = await deepseek.chat.completions.create(
      {
        model: MODEL,
        temperature: 0.8,
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

    const kit = sanitizeKit(parsed);
    if (!kit) return serviceUnavailable();

    return NextResponse.json(
      { success: true, data: kit },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[holiday-marketing] DeepSeek call failed:", err);
    return serviceUnavailable();
  }
}
