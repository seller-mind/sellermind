import { NextResponse } from "next/server";
import OpenAI from "openai";
import { applyPreUsageChecks, buildLimitExceededResponse } from "@/lib/security";
import { checkAndIncrementUsage } from "@/lib/usage";

// Runtime declarations (also addresses BUG-19).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Etsy Tag Generator — DeepSeek-backed implementation.
 *
 * P0-04 fix (full audit 20260625): removed the prompt instruction that asked
 * DeepSeek to "estimate monthly search volume" because we have NO live Etsy
 * search-volume data feed. Fabricating volume numbers misled users (FTC §5).
 * The API now returns AI-suggested tags plus a qualitative `competition`
 * estimate based on length/specificity heuristics; `volume` is no longer in
 * the response. The front-end has been updated accordingly. The legacy
 * GeneratedTag response shape keeps a `volume` field set to "—" purely for
 * backward compatibility with any cached front-end bundle that hasn't picked
 * up the new build yet; new front-end code ignores it.
 *
 * Front-end contract:
 *   request:  { productDescription, currentTitle, category }
 *   response: { success: true, data: { tags: [{text, competition}] } }
 *     - tags: up to 13 entries, each text <= 20 chars (Etsy limit)
 *     - competition: "High" | "Medium" | "Low" — qualitative estimate only,
 *       based on tag length/specificity, NOT live Etsy search data.
 */

const DEEPSEEK_TIMEOUT_MS = 30_000;
const MODEL = "deepseek-chat";

const SYSTEM_PROMPT = `You are an expert Etsy SEO specialist focused on tag/keyword optimization, drawing on publicly documented Etsy SEO best practices.

Your task: given a product description (and optional title/category), produce EXACTLY 13 Etsy tags optimized for the 13 tag slots Etsy gives every listing.

Hard constraints:
- Output exactly 13 tags. No more, no less.
- Each tag MUST be <= 20 characters (Etsy hard limit). Single words are wasteful; prefer 2-3 word phrases.
- Each tag is multi-word lowercase, separated by spaces (no commas, no hyphens unless the keyword itself contains one).
- Do not repeat the same tag, and do not include single-letter or pure stop-word tags.
- Distribute the 13 tags across:
   * 4-5 broad buyer terms (e.g. "personalized gift", "handmade jewelry"),
   * 5-6 mid-tail descriptive terms (style + product, material + product, audience + product),
   * 2-3 long-tail / niche terms (specific occasion, recipient).
- For each tag, set "competition" to "High", "Medium", or "Low" as a QUALITATIVE estimate based on tag specificity and length: shorter / broader phrases tend to be "High", longer / more specific phrases tend to be "Low". Aim for a healthy mix (rough target: 3 High, 6 Medium, 4 Low). This is an AI heuristic, not live Etsy data.

OUTPUT FORMAT - return STRICT JSON only, no markdown, no commentary:
{
  "tags": [
    { "text": "<tag string, <= 20 chars>", "competition": "High" | "Medium" | "Low" },
    ... 13 items total
  ]
}

Only those two fields per tag. Do not output any extra commentary or keys.`;

interface TagRequest {
  productDescription?: string;
  currentTitle?: string;
  category?: string;
  email?: string;
}

interface GeneratedTag {
  text: string;
  volume: string; // legacy field, always "—"; deprecated
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
    const t = item as { text?: unknown; competition?: unknown };
    if (typeof t.text !== "string") continue;
    const text = t.text.trim().toLowerCase().slice(0, 20);
    if (!text || seen.has(text)) continue;
    seen.add(text);

    const competition = isValidCompetition(t.competition) ? t.competition : "Medium";
    // volume kept as "—" placeholder to avoid breaking legacy front-end consumers
    cleaned.push({ text, volume: "—", competition });
  }

  if (cleaned.length === 0) return null;
  // Etsy gives 13 tag slots — truncate excess, keep what we have if short.
  return cleaned.slice(0, 13);
}

export async function POST(request: Request) {
  // Security gate — abuse detection, per-IP rate limit, global daily cap
  const preCheck = await applyPreUsageChecks(request);
  if (preCheck) return preCheck;

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
