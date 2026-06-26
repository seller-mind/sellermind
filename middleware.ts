import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// CN GeoBlock with legal-pages whitelist.
//
// IMPORTANT: When this site is fronted by Cloudflare proxy → Vercel,
// `x-vercel-ip-country` is derived from the Cloudflare edge IP (not the
// real client IP), so a CN client may show a non-CN value here. We
// therefore treat *either* `cf-ipcountry` *or* `x-vercel-ip-country`
// returning "CN" as a CN request, and let `cf-ipcountry` (truth from
// CF edge) take precedence.
export function middleware(request: NextRequest) {
  const cfCountry = request.headers.get('cf-ipcountry') || ''
  const vCountry = request.headers.get('x-vercel-ip-country') || ''
  const isCN = cfCountry === 'CN' || vCountry === 'CN'

  if (isCN) {
    const path = request.nextUrl.pathname

    // Legal / compliance pages — must remain reachable from CN
    // (GDPR Art.13 / CCPA §1798.100 information-disclosure duty).
    const LEGAL_PATHS = ['/privacy', '/terms', '/dmca', '/cookies']
    if (LEGAL_PATHS.some(p => path === p || path.startsWith(p + '/'))) {
      return NextResponse.next()
    }

    // Webhook endpoints must remain callable (payment / 3P callbacks).
    if (path.startsWith('/api/webhooks')) {
      return NextResponse.next()
    }

    // Block everything else with 451 (Unavailable For Legal Reasons).
    return new NextResponse(
      'This service is not available in your region.',
      {
        status: 451,
        statusText: 'Unavailable For Legal Reasons',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
