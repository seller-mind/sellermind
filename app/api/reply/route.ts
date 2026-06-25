import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  REPLY_SYSTEM_PROMPT,
  REPLY_TONE_GUIDE,
  buildReplyUserPrompt,
} from "@/lib/api/prompts";
import { checkAndIncrementUsage } from "@/lib/usage";
import { applyPreUsageChecks } from "@/lib/security";

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


export async function POST(req: NextRequest) {
  // Security gate — abuse detection, per-IP rate limit, global daily cap
  const preCheck = await applyPreUsageChecks(req);
  if (preCheck) return preCheck;

  const startTime = Date.now();
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: `Too many requests. Please wait ${rateLimit.resetIn} seconds.`, retry_after_seconds: rateLimit.resetIn } },
      { status: 429 }
    );
  }

  // Parse body and extract email
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INVALID_INPUT', message: 'Invalid request body.' } }, { status: 400 });
  }
  const email = (body.email as string) || req.nextUrl.searchParams.get('email') || '';

  // Check usage limits
  const { allowed, isSubscribed } = await checkAndIncrementUsage(email);
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

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: { code: "AI_SERVICE_ERROR", message: "DeepSeek API key is not configured." } }, { status: 500 });
  }

  try {
    const { scenario, buyerMessage, tone } = body as { scenario?: string; buyerMessage?: string; tone?: string };

    if (!buyerMessage) {
      return NextResponse.json({ success: false, error: { code: "INVALID_INPUT", message: "Buyer message is required." } }, { status: 400 });
    }

    const openai = new OpenAI({ 
      apiKey,
      baseURL: "https://api.deepseek.com"
    });
    const systemPrompt = `${REPLY_SYSTEM_PROMPT}\n\n${REPLY_TONE_GUIDE}`;
    const userPrompt = buildReplyUserPrompt({ scenario, buyerMessage, tone });

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
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
