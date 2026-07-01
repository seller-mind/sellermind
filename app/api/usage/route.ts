import { NextRequest, NextResponse } from 'next/server'
import { getUsageInfo } from '@/lib/usage'
import {
  buildRateLimitResponse,
  checkIpRateLimit,
  withRateLimitHeaders,
} from '@/lib/ip-rate-limit'

// PII / privacy hardening (P0-C fix · 2026-06-26):
//
// The previous version accepted `GET /api/usage?email=<user-email>` and
// `UsageBanner` (rendered on every page via app/layout.tsx) called it on
// every navigation. That pushed real user emails into:
//   - Vercel Function access logs
//   - Cloudflare analytics request URLs
//   - browser history
//   - the `Referer` header for any subsequent navigation
//
// We now require POST with the email in the JSON body so it stays out of
// any URL-based logging. GET is kept ONLY so that a misrouted/cached
// browser doesn't surface a noisy 405 error — it returns a 400 with an
// explanation and does NOT process the query string. We *deliberately*
// do not pass `searchParams.get('email')` through to `getUsageInfo` even
// though the param may still be present from stale clients/CDN caches.

// P2 fix (2026-07-01): per-IP rate limit — 60 req / 60s. UsageBanner is
// rendered on every page navigation and legitimately polls this endpoint
// on route changes, so we allow ~1 req/sec/IP. That still blocks scripted
// enumeration (which would try to guess valid emails via response shape).
const RL_CFG = { scope: 'usage', limit: 60, windowSec: 60 } as const

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function buildEmptyUsage() {
  return { remaining: 0, totalUsed: 0, isSubscribed: false, freeLimit: 3 }
}

export async function POST(request: NextRequest) {
  const rl = await checkIpRateLimit(request, RL_CFG)
  if (!rl.allowed) return buildRateLimitResponse(rl)

  try {
    let email = ''
    try {
      const body = await request.json()
      if (body && typeof body.email === 'string') {
        email = body.email.trim().toLowerCase()
      }
    } catch {
      // missing / malformed body → treat as anonymous, return defaults
    }

    // Defence-in-depth: even if a sloppy client appends ?email=... to the
    // POST URL, we will NOT honor it — body only.
    if (!email) {
      return withRateLimitHeaders(
        NextResponse.json(buildEmptyUsage(), { status: 200 }),
        rl,
      )
    }

    const info = await getUsageInfo(email)
    // Disable any intermediate caching so per-user usage state can't be
    // served from another user's cached response.
    return withRateLimitHeaders(
      NextResponse.json(info, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        },
      }),
      rl,
    )
  } catch (error) {
    console.error('Usage API error:', error)
    return withRateLimitHeaders(
      NextResponse.json(buildEmptyUsage(), { status: 200 }),
      rl,
    )
  }
}

// Block the legacy GET path explicitly. We intentionally do NOT read
// `searchParams.get('email')` here — that would defeat the purpose of
// this fix by re-introducing email-in-URL on the back end. Old clients
// (cached UsageBanner.js) will receive 400 and silently render no banner
// (see components/shared/UsageBanner.tsx error handler).
export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Use POST with JSON body { "email": "..." }.' },
    {
      status: 405,
      headers: {
        Allow: 'POST',
        'Cache-Control': 'no-store',
      },
    },
  )
}
