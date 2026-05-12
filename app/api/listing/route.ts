import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  LISTING_SYSTEM_PROMPT,
  LISTING_RULES,
  buildListingUserPrompt,
} from "@/lib/api/prompts";
import { checkAndIncrementUsage } from "@/lib/usage";
import { isClerkConfigured } from "@/lib/clerk-helpers";

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

// Safe auth function that handles Clerk not configured
async function getUserId(): Promise<string | null> {
  if (!isClerkConfigured()) {
    return null; // No auth required when Clerk is not configured
  }
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = auth();
    return userId;
  } catch (error) {
    console.warn("Clerk auth error:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
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

  // Check user authentication (skip if Clerk not configured)
  const userId = await getUserId();
  if (isClerkConfigured() && !userId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Please sign in to use this tool.",
        },
      },
      { status: 401 }
    );
  }

  // Check usage limits (will return allowed=true if Clerk not configured)
  const { allowed, remaining, isSubscribed } = await checkAndIncrementUsage();
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

  // Check API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "AI_SERVICE_ERROR",
          message: "OpenAI API key is not configured.",
        },
      },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { productName, sellingPoints, category, tone } = body;

    if (!productName || !sellingPoints || !Array.isArray(sellingPoints)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Product name and 3 selling points are required.",
          },
        },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `${LISTING_SYSTEM_PROMPT}\n\n${LISTING_RULES}`;
    const userPrompt = buildListingUserPrompt({ productName, sellingPoints, category, tone });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
      throw new Error("Empty response from OpenAI");
    }

    const data = JSON.parse(content);
    const processingTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          tokens_used: response.usage?.total_tokens || 0,
          processing_time_ms: processingTime,
        },
      },
      {
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (error: unknown) {
    console.error("Listing API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("JSON")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AI_SERVICE_ERROR",
            message: "Failed to parse AI response. Please try again.",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "AI_SERVICE_ERROR",
          message: "An error occurred while generating. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
