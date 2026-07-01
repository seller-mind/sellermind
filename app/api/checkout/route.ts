import { NextRequest, NextResponse } from 'next/server'
import {
  buildRateLimitResponse,
  checkIpRateLimit,
  withRateLimitHeaders,
} from '@/lib/ip-rate-limit'

// P0-02 fix (full audit 20260625):
// Switched from Creem (account permanently suspended 2026-06-10) to Dodo Payments.
// Front-end already points users to Dodo via hardcoded URLs; this API endpoint
// is the canonical server-side path and must mirror that.
const DODO_PRODUCT_IDS = {
  monthly: 'pdt_0Nh4as9LEJmfoZNpeaHC6',
  yearly: 'pdt_0Nh4asKyfYxPzDnExvRVo',
} as const

// P2 fix (2026-07-01): per-IP rate limit — 10 req / 60s. Payment path is the
// most sensitive endpoint; the tight budget deters URL-enumeration abuse and
// mass session creation while remaining well above any legitimate one-user
// click-rate.
const RL_CFG = { scope: 'checkout', limit: 10, windowSec: 60 } as const

type PlanKey = keyof typeof DODO_PRODUCT_IDS

function isPlan(value: unknown): value is PlanKey {
  return value === 'monthly' || value === 'yearly'
}

export async function POST(req: NextRequest) {
  const rl = await checkIpRateLimit(req, RL_CFG)
  if (!rl.allowed) return buildRateLimitResponse(rl)

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return withRateLimitHeaders(
      NextResponse.json(
        { error: { code: 'INVALID_BODY', message: 'Body must be JSON' } },
        { status: 400 },
      ),
      rl,
    )
  }

  // Accept either { plan: 'monthly' | 'yearly' } (preferred)
  // or legacy { productId | variantId } from older clients.
  const raw =
    (typeof body.plan === 'string' && body.plan) ||
    (typeof body.productId === 'string' && body.productId) ||
    (typeof body.variantId === 'string' && body.variantId) ||
    ''

  if (!isPlan(raw)) {
    return withRateLimitHeaders(
      NextResponse.json(
        {
          error: {
            code: 'INVALID_PLAN',
            message: 'plan must be one of: monthly, yearly',
          },
        },
        { status: 400 },
      ),
      rl,
    )
  }

  const productId = DODO_PRODUCT_IDS[raw]
  const email =
    (typeof body.email === 'string' ? body.email : '').trim().toLowerCase()

  const params = new URLSearchParams()
  const siteUrl = process.env.SITE_URL || 'https://thesellermind.com'
  params.set('redirect_url', `${siteUrl}/payment-success`)
  if (email) params.set('email', email)

  const url = `https://checkout.dodopayments.com/buy/${productId}?${params.toString()}`

  return withRateLimitHeaders(NextResponse.json({ url }), rl)
}

export async function GET() {
  return NextResponse.json(
    {
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Use POST with { plan: "monthly" | "yearly" }',
      },
    },
    { status: 405 },
  )
}
