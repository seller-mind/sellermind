import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  LISTING_SYSTEM_PROMPT,
  LISTING_RULES,
  buildListingUserPrompt,
} from "@/lib/api/prompts";
import { checkAndIncrementUsage } from "@/lib/usage";
import { applyPreUsageChecks } from "@/lib/security";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return { allowed: true, remaining: 9, resetIn: 60 };
  }

  if (limit.count >= 10) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((limit.resetTime - now) / 1000) };
  }

  limit.count++;
  return { allowed: true, remaining: 10 - limit.count, resetIn: Math.ceil((limit.resetTime - now) / 1000) };
}

// -----------------------------------------------------------------------------
// Etsy 20-char tag hard limit — server-side safeguard.
// The LLM prompt already instructs "≤ 20 chars", but occasional violations slip
// through (observed on "Personalized Velvet Ring Box" input → "custom velvet
// ring box" = 22 chars). Etsy silently rejects any tag over 20 chars, so we
// enforce this on the server before returning to the client.
//
// Strategy:
//   1. Filter DROP any tag > 20 chars (quality-first).
//   2. Case-insensitive de-duplication.
//   3. If < 8 valid tags survive, smart-truncate word-by-word from the tail
//      as a fallback so users still get a usable set.
//   4. Cap final list at 13.
// -----------------------------------------------------------------------------
function enforceTagLimit(rawTags: unknown): string[] {
  if (!Array.isArray(rawTags)) return [];

  const cleaned = rawTags
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const seen = new Set<string>();
  const valid: string[] = [];
  for (const t of cleaned) {
    if (t.length > 20) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    valid.push(t);
  }

  // Fallback: smart-truncate over-limit tags if we ended up with too few.
  if (valid.length < 8) {
    for (const t of cleaned) {
      if (valid.length >= 13) break;
      if (t.length <= 20) continue;
      let s = t;
      while (s.length > 20 && s.includes(" ")) {
        s = s.slice(0, s.lastIndexOf(" ")).trim();
      }
      if (s.length > 20) s = s.slice(0, 20).trim();
      if (s.length === 0) continue;
      const k = s.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      valid.push(s);
    }
  }

  return valid.slice(0, 13);
}

export async function POST(req: NextRequest) {
  // Security gate — abuse detection, per-IP rate limit, global daily cap
  const preCheck = await applyPreUsageChecks(req);
  if (preCheck) return preCheck;

  const startTime = Date.now();
  const ip = req.headers.get("x-forwarded-for") || "anonymous";

  // Rate limiting
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Too many requests. Please wait ${rateLimit.resetIn} seconds.`,
          retry_after_seconds: rateLimit.resetIn,
        },
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn)),
        },
      }
    );
  }

  // Parse body and extract email
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: { code: "INVALID_INPUT", message: "Invalid request body." } }, { status: 400 });
  }

  const email = (body.email as string) || req.nextUrl.searchParams.get("email") || "";

  // Check usage limits
  const { allowed, remaining, isSubscribed } = await checkAndIncrementUsage(email);
  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: isSubscribed ? "SUBSCRIPTION_EXPIRED" : "LIMIT_EXCEEDED",
          message: isSubscribed
            ? "Your subscription has expired. Please renew to continue."
            : "You've used your 3 free uses this month. Upgrade to Pro for unlimited access.",
          upgradeUrl: "/pricing",
        },
      },
      { status: 403 }
    );
  }

  // Check DeepSeek API key
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: { code: "AI_SERVICE_ERROR", message: "DeepSeek API key is not configured." } },
      { status: 500 }
    );
  }

  try {
    const { productName, sellingPoints, category, tone } = body as {
      productName?: string;
      sellingPoints?: string[];
      category?: string;
      tone?: string;
    };

    if (!productName || !sellingPoints || !Array.isArray(sellingPoints)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Product name and 3 selling points are required." } },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com"
    });

    // Extra prompt-layer reinforcement for the 20-char hard limit.
    // This is appended on TOP of LISTING_RULES (which already contains the rule)
    // so the constraint appears both at the top of the system prompt and again
    // right before the model starts generating — belt AND suspenders.
    const TAG_LIMIT_REINFORCEMENT = `\n\n## FINAL CHECK — ETSY 20-CHAR TAG LIMIT (STRICT, NON-NEGOTIABLE)\nEvery single string in the "tags" array MUST be 20 characters or fewer, INCLUDING spaces. Count each tag character-by-character before emitting it. If a tag would exceed 20 characters, shorten it by dropping the least essential word or using a shorter synonym (e.g. "custom velvet ring box" (22) → "velvet ring box" (15); "personalized ring holder" (24) → "ring holder gift" (16)). This is an Etsy platform hard limit — tags over 20 chars are rejected. The server WILL silently drop any over-limit tag before returning to the user, so violating this rule directly reduces the number of tags the seller receives. NO EXCEPTIONS.`;

    const systemPrompt = `${LISTING_SYSTEM_PROMPT}\n\n${LISTING_RULES}${TAG_LIMIT_REINFORCEMENT}`;
    const userPrompt = buildListingUserPrompt({ productName, sellingPoints, category, tone });

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from DeepSeek");
    }

    const data = JSON.parse(content);

    // Server-side safeguard: enforce Etsy's 20-char tag limit no matter what.
    if (data && typeof data === "object" && "tags" in data) {
      data.tags = enforceTagLimit((data as { tags: unknown }).tags);
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json(
      { success: true, data, meta: { tokens_used: response.usage?.total_tokens || 0, processing_time_ms: processingTime } },
      { headers: { "X-RateLimit-Limit": "10", "X-RateLimit-Remaining": String(rateLimit.remaining) } }
    );
  } catch (error: unknown) {
    console.error("Listing API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("JSON")) {
      return NextResponse.json(
        { success: false, error: { code: "AI_SERVICE_ERROR", message: "Failed to parse AI response. Please try again." } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: "AI_SERVICE_ERROR", message: "An error occurred while generating. Please try again." } },
      { status: 500 }
    );
  }
}
