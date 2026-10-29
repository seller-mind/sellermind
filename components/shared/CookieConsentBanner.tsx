'use client'

import CookieConsent from 'react-cookie-consent'
import Link from 'next/link'

export function CookieConsentBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept All Cookies"
      declineButtonText="Decline Non-Essential"
      enableDeclineButton
      cookieName="sellermind_cookie_consent"
      style={{ 
        background: '#1a1a2e', 
        padding: '16px 24px',
        fontSize: '14px'
      }}
      buttonStyle={{ 
        background: '#E07A5F', 
        color: 'white', 
        fontSize: '14px', 
        borderRadius: '8px', 
        padding: '8px 20px',
        fontWeight: 500
      }}
      declineButtonStyle={{ 
        background: 'transparent', 
        color: '#999', 
        fontSize: '13px', 
        border: '1px solid #555', 
        borderRadius: '8px', 
        padding: '8px 16px',
        marginLeft: '10px'
      }}
      expires={365}
    >
      {/* SM-04 fix (2026-10-28 QA): the old copy claimed we "analyze site
          traffic", but /privacy says "We do not currently use any third-party
          analytics or tracking cookies" and /cookies says "We currently do not
          use any analytics or advertising cookies". GDPR Art.13 requires the
          notice to be accurate, so the banner was overstating collection.
          Keep the wording in sync with both policy pages if that ever changes. */}
      This site uses only the cookies needed to keep you signed in and remember
      this choice. We do not use analytics, advertising or third-party tracking
      cookies.{' '}
      {/* F-18 fix: cookie banner previously linked to /privacy, but the
          detailed cookie disclosure lives on /cookies. GDPR Art.13 requires
          the "cookie information" link to point at the actual cookie policy.
          This also gives /cookies its first real inbound link. */}
      <Link href="/cookies" style={{ color: '#E07A5F', textDecoration: 'underline' }}>
        Cookie Policy
      </Link>
    </CookieConsent>
  )
}
