import { NextResponse } from "next/server";
import OpenAI from "openai";

// Runtime declarations (also addresses BUG-19).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Etsy Title Generator — DeepSeek-backed implementation (2026-06-14, Y2).
 *
 * Replaces the original template-only handler (and the 503 stub from Y).
 * Front-end contract (app/tools/etsy-title-generator/page.tsx) is unchanged:
 *   request:  { productType, keyFeatures, targetAudience, useCase, materials, style }
 *   response: { success: true, data: { titles: [{text, chars, score}] } }
 *
 * On any DeepSeek failure the route returns 503 +
 *   { success: false, error: { code: "AI_SERVICE_UNAVAILABLE", message: ... } }
 * which the front-end already handles by falling back to a local demo set.
 *
 * Uses process.env.DEEPSEEK_API_KEY (configured via Vercel env vars).
 */

const DEEPSEEK_TIMEOUT_MS = 30_000;
const MODEL = "deepseek-chat";

const SYSTEM_PROMPT = `You are an expert Etsy SEO copywriter who has helped thousands of handmade and vintage shops rank on the first page of Etsy search.

Your task: given a product brief, produce exactly 5 high-quality Etsy listing titles that follow modern (2025) Etsy SEO best practices:
- Each title MUST be 70-140 characters long.
- Front-load the most-searched buyer keyword(s) in the first 30 characters.
- Use natural human phrasing, no keyword stuffing, no ALL CAPS, no emoji spam.
- Use the pipe character ( | ) or comma to separate phrases. Mix both across the 5 titles.
- Each of the 5 titles must take a different angle (e.g. gift framing, material/style framing, occasion framing, audience framing, benefit framing).
- Score each title:
   * "Excellent" - 110-140 chars, strong keyword in first 30 chars, includes a buyer intent term (gift, custom, handmade, personalized...), reads naturally.
   * "Good" - 80-109 chars, keyword present, reads naturally but missing one optimization.
   * "Fair" - 70-79 chars OR weaker keyword placement.

OUTPUT FORMAT - return STRICT JSON only, no markdown, no commentary:
{
  "titles": [
    { "text": "<title string>", "chars": <integer length of text>, "score": "Excellent" | "Good" | "Fair" },
    ... 5 items total
  ]
}

The "chars" field MUST equal the character length of "text" exactly. Do not include any keys other than titles/text/chars/score.`;

interface TitleRequest {
  productType?: string;
  keyFeatures?: string;
  targetAudience?: string;
  useCase?: string;
  materials?: string;
  style?: string;
}

interface GeneratedTitle {
  text: string;
  chars: number;
  score: "Excellent" | "Good" | "Fair";
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

function buildUserPrompt(body: TitleRequest): string {
  const productType = (body.productType || "").trim();
  const keyFeatures = (body.keyFeatures || "").trim();
  const targetAudience = (body.targetAudience || "").trim();
  const useCase = (body.useCase || "").trim();
  const materials = (body.materials || "").trim();
  const style = (body.style || "").trim();

  return `Generate 5 Etsy titles for the following product:

- Product type: ${productType || "(not specified)"}
- Key features / keywords: ${keyFeatures || "(not specified)"}
- Target audience: ${targetAudience || "(not specified)"}
- Use case / occasion: ${useCase || "(not specified)"}
- Materials: ${materials || "(not specified)"}
- Style: ${style || "(not specified)"}

Return strict JSON exactly matching the schema in the system prompt.`;
}

function isValidScore(s: unknown): s is GeneratedTitle["score"] {
  return s === "Excellent" || s === "Good" || s === "Fair";
}

function sanitizeTitles(raw: unknown): GeneratedTitle[] | null {
  if (!raw || typeof raw !== "object") return null;
  const arr = (raw as { titles?: unknown }).titles;
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const cleaned: GeneratedTitle[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const t = item as { text?: unknown; chars?: unknown; score?: unknown };
    if (typeof t.text !== "string" || !t.text.trim()) continue;
    const text = t.text.trim();
    const chars =
      typeof t.chars === "number" && Number.isFinite(t.chars)
        ? Math.round(t.chars)
        : text.length;
    const score = isValidScore(t.score) ? t.score : "Good";
    cleaned.push({ text, chars: chars > 0 ? chars : text.length, score });
  }

  return cleaned.length > 0 ? cleaned.slice(0, 5) : null;
}

export async function POST(request: Request) {
  let body: TitleRequest;
  try {
    body = (await request.json()) as TitleRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  if (!body?.productType?.trim() || !body?.keyFeatures?.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_INPUT", message: "productType and keyFeatures are required." },
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

    const titles = sanitizeTitles(parsed);
    if (!titles) return serviceUnavailable();

    return NextResponse.json(
      { success: true, data: { titles } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    // Network error / timeout / rate-limit / other openai-sdk error.
    console.error("[title-generate] DeepSeek call failed:", err);
    return serviceUnavailable();
  }
}
