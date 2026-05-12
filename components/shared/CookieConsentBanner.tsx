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
      We use cookies to enhance your experience and analyze site traffic.{' '}
      <Link href="/privacy" style={{ color: '#E07A5F', textDecoration: 'underline' }}>
        Privacy Policy
      </Link>
    </CookieConsent>
  )
}
