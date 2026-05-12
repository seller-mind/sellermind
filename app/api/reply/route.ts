import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  REPLY_SYSTEM_PROMPT,
  REPLY_TONE_GUIDE,
  buildReplyUserPrompt,
} from "@/lib/api/prompts";
import { checkAndIncrementUsage } from "@/lib/usage";
import { isClerkConfigured } from "@/lib/clerk-helpers";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string) {
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
    return null;
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
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: `Too many requests. Please wait ${rateLimit.resetIn} seconds.`, retry_after_seconds: rateLimit.resetIn } },
      { status: 429 }
    );
  }

  // Check user authentication (skip if Clerk not configured)
  const userId = await getUserId();
  if (isClerkConfigured() && !userId) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Please sign in to use this tool." } },
      { status: 401 }
    );
  }

  // Check usage limits
  const { allowed, isSubscribed } = await checkAndIncrementUsage();
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: { code: "AI_SERVICE_ERROR", message: "OpenAI API key is not configured." } }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { scenario, buyerMessage, tone } = body;

    if (!buyerMessage) {
      return NextResponse.json({ success: false, error: { code: "INVALID_INPUT", message: "Buyer message is required." } }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });
    const systemPrompt = `${REPLY_SYSTEM_PROMPT}\n\n${REPLY_TONE_GUIDE}`;
    const userPrompt = buildReplyUserPrompt({ scenario, buyerMessage, tone });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const data = JSON.parse(content);
    return NextResponse.json({
      success: true,
      data,
      meta: { tokens_used: response.usage?.total_tokens || 0, processing_time_ms: Date.now() - startTime },
    });
  } catch (error: unknown) {
    console.error("Reply API error:", error);
    return NextResponse.json(
      { success: false, error: { code: "AI_SERVICE_ERROR", message: "Failed to generate reply. Please try again." } },
      { status: 500 }
    );
  }
}
