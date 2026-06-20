import { NextResponse } from "next/server";
import OpenAI from "openai";

// Runtime declarations (also addresses BUG-19).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Etsy Tag Generator — DeepSeek-backed implementation (2026-06-14, Y2).
 *
 * Replaces the original template-only handler (and the 503 stub from Y).
 * Front-end contract (app/tools/etsy-tag-generator/page.tsx) is unchanged:
 *   request:  { productDescription, currentTitle, category }
 *   response: { success: true, data: { tags: [{text, volume, competition}] } }
 *     - tags: exactly 13 entries, each text <= 20 chars (Etsy limit)
 *     - competition: "High" | "Medium" | "Low"
 *     - volume: estimated monthly search volume label, e.g. "5,200" or "1.2K"
 *
 * On any DeepSeek failure the route returns 503 + AI_SERVICE_UNAVAILABLE,
 * which the front-end falls back gracefully.
 */

const DEEPSEEK_TIMEOUT_MS = 30_000;
const MODEL = "deepseek-chat";

const SYSTEM_PROMPT = `You are an expert Etsy SEO specialist focused on tag/keyword optimization. You have analyzed millions of Etsy listings and search trends.

Your task: given a product description (and optional title/category), produce EXACTLY 13 Etsy tags optimized for the 13 tag slots Etsy gives every listing.

Hard constraints:
- Output exactly 13 tags. No more, no less.
- Each tag MUST be <= 20 characters (Etsy hard limit). Single words are wasteful; prefer 2-3 word phrases.
- Each tag is multi-word lowercase, separated by spaces (no commas, no hyphens unless the keyword itself contains one).
- Do not repeat the same tag, and do not include single-letter or pure stop-word tags.
- Distribute the 13 tags across:
   * 4-5 broad/high-volume buyer terms (e.g. "personalized gift", "handmade jewelry"),
   * 5-6 mid-tail descriptive terms (style + product, material + product, audience + product),
   * 2-3 long-tail / niche terms (specific occasion, recipient).
- For each tag, estimate "volume" as a realistic monthly search-volume label string. Examples: "12,000", "5,400", "2,100", "850", "320". Bigger phrases get smaller volumes.
- For each tag, set "competition" to "High", "Medium", or "Low" — broad terms tend to be High, niche long-tail tends to be Low. Aim for a healthy mix (rough target: 3 High, 6 Medium, 4 Low).

OUTPUT FORMAT - return STRICT JSON only, no markdown, no commentary:
{
  "tags": [
    { "text": "<tag string, <= 20 chars>", "volume": "<volume label>", "competition": "High" | "Medium" | "Low" },
    ... 13 items total
  ]
}

Only those three fields per tag. Do not output any extra commentary or keys.`;

interface TagRequest {
  productDescription?: string;
  currentTitle?: string;
  category?: string;
}

interface GeneratedTag {
  text: string;
  volume: string;
  competition: "Low" | "Medium" | "High";
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

function buildUserPrompt(body: TagRequest): string {
  const productDescription = (body.productDescription || "").trim();
  const currentTitle = (body.currentTitle || "").trim();
  const category = (body.category || "").trim();

  return `Generate 13 Etsy tags for the following listing:

- Product description: ${productDescription || "(not specified)"}
- Current title: ${currentTitle || "(not specified)"}
- Category: ${category || "(not specified)"}

Return strict JSON exactly matching the schema in the system prompt.`;
}

function isValidCompetition(c: unknown): c is GeneratedTag["competition"] {
  return c === "Low" || c === "Medium" || c === "High";
}

function sanitizeTags(raw: unknown): GeneratedTag[] | null {
  if (!raw || typeof raw !== "object") return null;
  const arr = (raw as { tags?: unknown }).tags;
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const cleaned: GeneratedTag[] = [];
  const seen = new Set<string>();

  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const t = item as { text?: unknown; volume?: unknown; competition?: unknown };
    if (typeof t.text !== "string") continue;
    const text = t.text.trim().toLowerCase().slice(0, 20);
    if (!text || seen.has(text)) continue;
    seen.add(text);

    const volume =
      typeof t.volume === "string" && t.volume.trim()
        ? t.volume.trim()
        : typeof t.volume === "number"
          ? String(t.volume)
          : "—";
    const competition = isValidCompetition(t.competition) ? t.competition : "Medium";
    cleaned.push({ text, volume, competition });
  }

  if (cleaned.length === 0) return null;
  // Etsy gives 13 tag slots — truncate excess, keep what we have if short.
  return cleaned.slice(0, 13);
}

export async function POST(request: Request) {
  let body: TagRequest;
  try {
    body = (await request.json()) as TagRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  if (!body?.productDescription?.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_INPUT", message: "productDescription is required." },
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

    const tags = sanitizeTags(parsed);
    if (!tags) return serviceUnavailable();

    return NextResponse.json(
      { success: true, data: { tags } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[tag-generate] DeepSeek call failed:", err);
    return serviceUnavailable();
  }
}
