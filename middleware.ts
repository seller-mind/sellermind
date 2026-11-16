import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// CN GeoBlock with crawler + legal-pages + webhook whitelist.
//
// IMPORTANT: When this site is fronted by Cloudflare proxy → Vercel,
// `x-vercel-ip-country` is derived from the Cloudflare edge IP (not the
// real client IP), so a CN client may show a non-CN value here. We
// therefore treat *either* `cf-ipcountry` *or* `x-vercel-ip-country`
// returning "CN" as a CN request, and let `cf-ipcountry` (truth from
// CF edge) take precedence.
//
// 2026-11-16: crawler whitelist added. A 451 to a search-engine crawler
// is indistinguishable from "page does not exist" and kills indexing for
// that URL. Never geo-block a crawler.

// Search-engine and AI crawler UAs.
const CRAWLER_RE =
  /googlebot|bingbot|yandex|duckduckbot|baiduspider|applebot|slurp|sogou|exabot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|gptbot|oai-searchbot|claudebot|claude-web|perplexitybot|amazonbot|youbot|ccbot/i

// Legal / compliance pages — must remain reachable from anywhere
// (GDPR Art.13 / CCPA §1798.100 information-disclosure duty).
const LEGAL_PATHS = ['/privacy', '/terms', '/dmca', '/cookies']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const ua = request.headers.get('user-agent') || ''

  // 1. Crawlers always pass — SEO depends on this.
  if (CRAWLER_RE.test(ua)) {
    return NextResponse.next()
  }

  // 2. Legal / compliance pages.
  if (LEGAL_PATHS.some(p => path === p || path.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // 3. Webhook endpoints must remain callable (payment / 3P callbacks).
  if (path.startsWith('/api/webhooks')) {
    return NextResponse.next()
  }

  const cfCountry = request.headers.get('cf-ipcountry') || ''
  const vCountry = request.headers.get('x-vercel-ip-country') || ''
  const isCN = cfCountry === 'CN' || vCountry === 'CN'

  if (isCN) {
    // Block with 451 (Unavailable For Legal Reasons).
    // Debug headers expose which signal triggered the block so the
    // geo-detection behaviour can be verified from outside.
    return new NextResponse(
      'This service is not available in your region.',
      {
        status: 451,
        statusText: 'Unavailable For Legal Reasons',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'x-geo-debug-cf': cfCountry || 'none',
          'x-geo-debug-vc': vCountry || 'none',
        },
      }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
