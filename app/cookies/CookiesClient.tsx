'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * /cookies page — GDPR Art.13 / ePrivacy compliant cookie policy + preference reset.
 *
 * The site uses `react-cookie-consent` with cookieName="sellermind_cookie_consent"
 * (see components/shared/CookieConsentBanner.tsx). Accepting sets it to "true"
 * and declining sets it to "false"; expiry is 365 days.
 *
 * F-004 (Batch 2): expose an explicit "Reset preferences" control so users can
 * re-open the consent banner. F-007 (Batch 2): make CCPA / CPRA / GDPR / VCDPA
 * geo language concrete instead of a single vague sentence.
 */
export default function CookiesClient() {
  const [currentState, setCurrentState] = useState<'accepted' | 'declined' | 'unset'>('unset')
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const readConsent = () => {
    if (typeof document === 'undefined') return 'unset' as const
    const match = document.cookie.match(/(?:^|;\s*)sellermind_cookie_consent=([^;]+)/)
    if (!match) return 'unset' as const
    const value = decodeURIComponent(match[1])
    if (value === 'true') return 'accepted' as const
    if (value === 'false') return 'declined' as const
    return 'unset' as const
  }

  useEffect(() => {
    setCurrentState(readConsent())
  }, [])

  const handleReset = () => {
    if (typeof document === 'undefined') return
    // Delete the react-cookie-consent cookie (all likely path/domain variants).
    const expire = 'Thu, 01 Jan 1970 00:00:00 GMT'
    const host = window.location.hostname
    const rootHost = host.split('.').slice(-2).join('.')
    document.cookie = `sellermind_cookie_consent=; expires=${expire}; path=/`
    document.cookie = `sellermind_cookie_consent=; expires=${expire}; path=/; domain=${host}`
    document.cookie = `sellermind_cookie_consent=; expires=${expire}; path=/; domain=.${rootHost}`
    // Also clear legacy localStorage entry if any (older banner impl used LS).
    try {
      window.localStorage.removeItem('cookie_consent')
      window.localStorage.removeItem('sellermind_cookie_consent')
    } catch {
      /* localStorage disabled in some privacy modes — ignore */
    }
    setCurrentState('unset')
    setResetMessage(
      'Your cookie preferences have been reset. Refresh this page (or navigate to any page) and the cookie banner will reappear so you can make a new choice.',
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground-primary sm:text-4xl">
          Cookie Preferences
        </h1>
        <p className="mt-2 text-foreground-secondary">Last updated: July 2026</p>
      </div>

      {/* Current state + Reset control (F-004) */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground-primary">
          Your Current Preference
        </h2>
        <p className="mt-2 text-sm text-foreground-secondary">
          Status:{' '}
          <strong className="text-foreground-primary">
            {currentState === 'accepted'
              ? 'Accepted all cookies'
              : currentState === 'declined'
              ? 'Declined non-essential cookies'
              : 'No preference recorded (banner will show on next page load)'}
          </strong>
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg bg-[#E07A5F] px-4 py-2 text-sm font-medium text-white hover:bg-[#d46a50] transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v6h6M20 20v-6h-6M20 4a9 9 0 0 0-15.5 3M4 20a9 9 0 0 0 15.5-3"
              />
            </svg>
            Reset preferences
          </button>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground-primary hover:border-primary transition-colors"
          >
            View Privacy Policy
          </Link>
        </div>

        {resetMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            ✓ {resetMessage}
          </div>
        )}
      </div>

      {/* What cookies we use */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground-primary">
          What cookies does SellerMind use?
        </h2>
        <div className="mt-4 space-y-4 text-sm text-foreground-secondary">
          <div>
            <h3 className="text-base font-semibold text-foreground-primary">
              Strictly necessary (always on)
            </h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>
                <code>sellermind_cookie_consent</code> — records your consent choice (accepted / declined). Duration: 365 days. Purpose: comply with GDPR / ePrivacy consent-recording obligations.
              </li>
              <li>
                Cloudflare bot-management &amp; DDoS-protection cookies (e.g. <code>__cf_bm</code>, <code>cf_clearance</code>) — set by our CDN. Purpose: distinguish humans from bots and protect against automated abuse. Duration: session to 30 days.
              </li>
              <li>
                Vercel session / feature-flag cookies — set when necessary by our hosting provider to route deployments. Duration: session.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground-primary">
              Functional (only after you use the site)
            </h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>
                <code>sellermind_email</code> — stored in <em>localStorage</em>, not a cookie. Contains the email you entered so we can track your free-tier usage quota and re-link your Pro subscription. You can clear it in your browser at any time.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground-primary">
              Analytics / advertising
            </h3>
            <p className="mt-2">
              <strong>We currently do not use any analytics or advertising cookies.</strong> No Google Analytics, no Facebook Pixel, no third-party ad tracking. If we introduce any in the future, we will update this page and re-request consent through the banner.
            </p>
          </div>
        </div>
      </div>

      {/* F-007: Concrete geo language */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground-primary">
          Your rights by region
        </h2>

        <div className="mt-4 space-y-6 text-sm text-foreground-secondary">
          <div>
            <h3 className="text-base font-semibold text-foreground-primary">
              🇪🇺 European Economic Area / United Kingdom (GDPR &amp; UK GDPR)
            </h3>
            <p className="mt-2">
              Under the General Data Protection Regulation (Regulation (EU) 2016/679) and the UK GDPR, we only set non-essential cookies with your prior <strong>opt-in consent</strong>. You can withdraw consent at any time using the <em>Reset preferences</em> button above. You also have the rights to access, rectify, erase, restrict, and port your personal data, and to lodge a complaint with your national supervisory authority. See our{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{' '}
              for the full list.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground-primary">
              🇺🇸 California (CCPA / CPRA)
            </h3>
            <p className="mt-2">
              Under the California Consumer Privacy Act (as amended by the CPRA), California residents have the right to know what personal information we collect, the right to delete it, the right to correct inaccurate data, and the right to opt out of &quot;sale&quot; or &quot;sharing&quot; of personal information for cross-context behavioral advertising.
            </p>
            <p className="mt-3">
              <strong>
                We do not sell your personal data to third parties, and we do not share it for cross-context behavioral advertising. This statement is applicable in California and constitutes our &quot;Do Not Sell or Share My Personal Information&quot; notice under CCPA/CPRA.
              </strong>
            </p>
            <p className="mt-3">
              To exercise your CCPA/CPRA rights, email{' '}
              <a href="mailto:privacy@thesellermind.com" className="text-primary hover:underline">
                privacy@thesellermind.com
              </a>
              . We will verify your request as required by the statute.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground-primary">
              🇺🇸 Virginia, Colorado, Connecticut, Utah &amp; other US state privacy laws (VCDPA / CPA / CTDPA / UCPA)
            </h3>
            <p className="mt-2">
              Under the Virginia Consumer Data Protection Act (VCDPA) and comparable statutes in Colorado (CPA), Connecticut (CTDPA), Utah (UCPA), and similar US state privacy laws, residents of those states have the right to access, correct, delete, and port personal data, and to opt out of targeted advertising, sale, and profiling that has legal effects.
            </p>
            <p className="mt-3">
              <strong>
                We do not sell your data, do not conduct targeted advertising, and do not perform automated profiling that produces legal or similarly significant effects.
              </strong>
            </p>
            <p className="mt-3">
              To exercise your rights, email{' '}
              <a href="mailto:privacy@thesellermind.com" className="text-primary hover:underline">
                privacy@thesellermind.com
              </a>
              .
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground-primary">
              Global Privacy Control (GPC) signal
            </h3>
            <p className="mt-2">
              We honour the{' '}
              <a
                href="https://globalprivacycontrol.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Global Privacy Control
              </a>{' '}
              browser signal as a valid opt-out of sale/sharing for California and other US-state residents, in addition to any preference set via the banner or this page.
            </p>
          </div>
        </div>
      </div>

      {/* How to control cookies at the browser level */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground-primary">
          Managing cookies in your browser
        </h2>
        <p className="mt-2 text-sm text-foreground-secondary">
          In addition to the <em>Reset preferences</em> button above, most browsers let you block or delete cookies globally. See vendor documentation for{' '}
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Chrome
          </a>
          ,{' '}
          <a
            href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Firefox
          </a>
          ,{' '}
          <a
            href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Safari
          </a>
          , and{' '}
          <a
            href="https://support.microsoft.com/en-us/microsoft-edge"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Edge
          </a>
          . Note that disabling strictly-necessary cookies may prevent parts of SellerMind from functioning correctly.
        </p>
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground-primary">Contact</h2>
        <p className="mt-2 text-sm text-foreground-secondary">
          Questions or requests about cookies or privacy? Email{' '}
          <a href="mailto:privacy@thesellermind.com" className="text-primary hover:underline">
            privacy@thesellermind.com
          </a>
          .
        </p>
      </div>

      <div className="flex justify-center">
        <Link
          href="/"
          className="text-primary hover:text-primary-hover font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
