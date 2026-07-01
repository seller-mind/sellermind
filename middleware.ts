import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware does two things:
//   (1) CN GeoBlock with legal-pages whitelist  (unchanged; see notes below).
//   (2) [NEW 2026-07-01] Generate a per-request CSP nonce and inject a
//       nonce-based Content-Security-Policy header for HTML responses,
//       replacing the previous static `'unsafe-inline'` CSP that lived in
//       next.config.js.
//
// P3 fix (2026-07-01): the accepted-risk P3 from the 06-29 red-team audit
// was that our CSP `script-src`/`style-src` still carried `'unsafe-inline'`,
// which defeats the whole point of CSP against XSS. We now emit a fresh
// nonce every request and wire it through:
//   - the *request* headers (`x-nonce`) so `app/layout.tsx` can read it
//     via `next/headers`. Once Next sees `x-nonce` on the request, it
//     automatically propagates the nonce to its own hydration `<script>`
//     tags without any per-tag manual annotation.
//   - the response CSP header so the browser accepts scripts/styles that
//     carry that nonce and rejects everything else.
// `'unsafe-eval'` is retained conservatively — Next 14 dev tooling and
// some third-party libs still emit eval; removing it can be a follow-up
// once we have full visibility.
//
// CN GeoBlock notes (unchanged):
//
// IMPORTANT: When this site is fronted by Cloudflare proxy → Vercel,
// `x-vercel-ip-country` is derived from the Cloudflare edge IP (not the
// real client IP), so a CN client may show a non-CN value here. We
// therefore treat *either* `cf-ipcountry` *or* `x-vercel-ip-country`
// returning "CN" as a CN request, and let `cf-ipcountry` (truth from
// CF edge) take precedence.

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // Nonce for scripts. `strict-dynamic` lets scripts loaded by a
    // nonce'd parent inherit trust; safer than a per-CDN allowlist.
    // `'unsafe-eval'` kept for Next 14 hydration / third-party lib compat.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`,
    // Nonce for <style> blocks; external stylesheets from Google Fonts /
    // rsms still allowed. Note: CSP `style-src` does NOT govern inline
    // `style="..."` attributes (that's `style-src-attr`), so removing
    // `'unsafe-inline'` here does not affect Tailwind utility classes or
    // React's `style={{}}` prop.
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://rsms.me`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com https://rsms.me",
    "connect-src 'self' https://thesellermind.com https://*.thesellermind.com https://vitals.vercel-insights.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ')
}

/**
 * Legacy CSP retained ONLY for `/etsy-seo/*` — 30 programmatic-SEO static
 * HTML pages committed to `public/etsy-seo/` and served via a next.config
 * rewrite. Those files have JSON-LD `<script>` and `<style>` blocks baked
 * in at authoring time and cannot be nonce-attributed at serve time (a
 * per-request nonce can only be injected by a dynamic renderer, not a
 * static file). Applying the strict nonce CSP to them would break every
 * one of those pages.
 *
 * Follow-up (P4, not blocking): rewrite `/etsy-seo/*` as a dynamic Next
 * route reading from a data file, at which point this exception can be
 * removed and every route falls under the strict CSP.
 */
const LEGACY_STATIC_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://rsms.me",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com https://rsms.me",
  "connect-src 'self' https://thesellermind.com https://*.thesellermind.com https://vitals.vercel-insights.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ')

// Web Crypto is available on the Edge runtime (which is where Next
// middleware runs). Node's `crypto.randomBytes` is NOT — so we use
// `crypto.getRandomValues` and base64-encode it.
function generateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  // btoa is available on the Edge runtime.
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const cfCountry = request.headers.get('cf-ipcountry') || ''
  const vCountry = request.headers.get('x-vercel-ip-country') || ''
  const isCN = cfCountry === 'CN' || vCountry === 'CN'

  // --- CN GeoBlock (unchanged behaviour) ---
  if (isCN) {
    // Legal / compliance pages — must remain reachable from CN
    // (GDPR Art.13 / CCPA §1798.100 information-disclosure duty).
    const LEGAL_PATHS = ['/privacy', '/terms', '/dmca', '/cookies']
    const isLegal = LEGAL_PATHS.some(
      (p) => path === p || path.startsWith(p + '/'),
    )

    // Webhook endpoints must remain callable (payment / 3P callbacks).
    const isWebhook = path.startsWith('/api/webhooks')

    if (!isLegal && !isWebhook) {
      // Block everything else with 451 (Unavailable For Legal Reasons).
      return new NextResponse(
        'This service is not available in your region.',
        {
          status: 451,
          statusText: 'Unavailable For Legal Reasons',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        },
      )
    }
    // Fall through to CSP for legal pages; API webhooks skip CSP below.
  }

  // --- Nonce + CSP for HTML responses ---
  // API responses are JSON and never execute inline scripts, so injecting
  // a fresh nonce per request there is pure overhead — skip.
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Legacy static HTML under /etsy-seo/* cannot receive a per-request
  // nonce (they're pre-authored files). Emit the relaxed LEGACY_STATIC_CSP
  // for this sub-path only. See LEGACY_STATIC_CSP comment above for the
  // full rationale and follow-up plan.
  if (path === '/etsy-seo' || path.startsWith('/etsy-seo/')) {
    const legacyRes = NextResponse.next()
    legacyRes.headers.set('Content-Security-Policy', LEGACY_STATIC_CSP)
    return legacyRes
  }

  const nonce = generateNonce()
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  // Next.js recommends also setting the CSP on the forwarded request
  // header so the framework itself sees it during SSR:
  //   https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
  requestHeaders.set('Content-Security-Policy', csp)

  const res = NextResponse.next({ request: { headers: requestHeaders } })
  res.headers.set('Content-Security-Policy', csp)
  return res
}

export const config = {
  // Original matcher preserved (drives CN GeoBlock coverage);
  // API routes now short-circuit CSP inside middleware() above.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
