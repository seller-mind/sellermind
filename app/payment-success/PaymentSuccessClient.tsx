'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * Dodo Payments redirect target after successful checkout.
 * Dodo will append `?subscription_id=sub_xxx&status=active&payment_id=pay_xxx`
 * (exact param set varies by event; we don't depend on any specific param —
 *  source of truth is the webhook landing in /api/webhooks/dodo).
 *
 * UX：
 *   - 立即给用户视觉确认（不要让用户面对 404 或空白页）
 *   - 把当前 email 存回 localStorage（与 PricingClient 一致）
 *   - 提示后台 webhook 落库可能有 1-3 秒延迟，5 秒后引导回 /tools 开始用 Pro
 */
export default function PaymentSuccessClient() {
  const [email, setEmail] = useState<string | null>(null)
  const [redirectIn, setRedirectIn] = useState(8)

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem('sellermind_email')) || ''
    if (stored) setEmail(stored)
  }, [])

  useEffect(() => {
    if (redirectIn <= 0) return
    const t = setTimeout(() => setRedirectIn((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [redirectIn])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-border p-8 shadow-lg text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-9 h-9 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-foreground-primary mb-3">
          Payment successful 🎉
        </h1>

        <p className="text-foreground-secondary mb-2">
          Thanks for subscribing to <strong>SellerMind Pro</strong>.
        </p>

        {email ? (
          <p className="text-sm text-foreground-muted mb-6">
            Your subscription is being activated for <strong>{email}</strong>. It usually takes a
            few seconds for our system to receive confirmation from Dodo Payments.
          </p>
        ) : (
          <p className="text-sm text-foreground-muted mb-6">
            Your subscription is being activated. It usually takes a few seconds for our system to
            receive confirmation from Dodo Payments.
          </p>
        )}

        <div className="space-y-3">
          <Link
            href="/tools"
            className="block w-full py-3 px-4 text-center font-medium rounded-lg bg-[#E07A5F] text-white hover:bg-[#d46a50] transition-colors"
          >
            Start using Pro tools
          </Link>
          <Link
            href="/pricing"
            className="block w-full py-2 px-4 text-center text-sm text-foreground-muted hover:text-foreground-primary"
          >
            Back to pricing
          </Link>
        </div>

        <p className="mt-6 text-xs text-foreground-muted">
          Questions? Email{' '}
          <a href="mailto:support@thesellermind.com" className="underline">
            support@thesellermind.com
          </a>
          .
        </p>

        {redirectIn > 0 && (
          <p className="mt-4 text-xs text-foreground-muted">
            Activating… You can refresh in {redirectIn}s if Pro features still show as locked.
          </p>
        )}
      </div>
    </div>
  )
}
