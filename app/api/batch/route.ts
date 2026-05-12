import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  BATCH_SYSTEM_PROMPT,
  BATCH_RULES,
  buildBatchUserPrompt,
} from "@/lib/api/prompts";
import { checkAndIncrementUsage } from "@/lib/usage";
import { auth } from "@clerk/nextjs/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return { allowed: true, remaining: 9, resetIn: 60 };
  }
  if (limit.count >= 5) { // Lower limit for batch operations
    return { allowed: false, remaining: 0, resetIn: Math.ceil((limit.resetTime - now) / 1000) };
  }
  limit.count++;
  return { allowed: true, remaining: 5 - limit.count, resetIn: Math.ceil((limit.resetTime - now) / 1000) };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: `Too many requests. Please wait ${rateLimit.resetIn} seconds.` } },
      { status: 429 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: { code: "AI_SERVICE_ERROR", message: "OpenAI API key is not configured." } }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { listingsText } = body;

    if (!listingsText || listingsText.trim().length < 20) {
      return NextResponse.json({ success: false, error: { code: "INVALID_INPUT", message: "Please provide listing content to optimize." } }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });
    const systemPrompt = `${BATCH_SYSTEM_PROMPT}\n\n${BATCH_RULES}`;
    const userPrompt = buildBatchUserPrompt(listingsText);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const data = JSON.parse(content);
    return NextResponse.json({
      success: true,
      data,
      meta: { tokens_used: response.usage?.total_tokens || 0, processing_time_ms: Date.now() - startTime },
    });
  } catch (error) {
    console.error("Batch API error:", error);
    return NextResponse.json(
      { success: false, error: { code: "AI_SERVICE_ERROR", message: "Failed to optimize listings. Please try again." } },
      { status: 500 }
    );
  }
}
