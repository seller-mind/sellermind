'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * Dodo Payments redirect target after successful checkout.
 * Dodo will append `?subscription_id=sub_xxx&status=active&payment_id=pay_xxx`
 * (exact param set varies by event; we don't depend on any specific param —
 *  source of truth is the webhook landing in /api/webhooks/dodo).
 *
 * UX (F-UX-08 · Batch 2):
 *   - 立即给用户视觉确认（不要让用户面对 404 或空白页）
 *   - 把当前 email 存回 localStorage（与 PricingClient 一致）
 *   - 5 秒 auto-redirect 到 /tools + countdown UI + "Skip →" 手动按钮
 *   - webhook 落库通常 <3s 完成，5s countdown 给一点缓冲又不至于卡用户
 */
const AUTO_REDIRECT_SECONDS = 5

export default function PaymentSuccessClient() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [redirectIn, setRedirectIn] = useState(AUTO_REDIRECT_SECONDS)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem('sellermind_email')) || ''
    if (stored) setEmail(stored)
  }, [])

  // Countdown tick
  useEffect(() => {
    if (paused) return
    if (redirectIn <= 0) return
    const t = setTimeout(() => setRedirectIn((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [redirectIn, paused])

  // Trigger auto-redirect when countdown reaches 0
  useEffect(() => {
    if (paused) return
    if (redirectIn <= 0) {
      router.push('/tools')
    }
  }, [redirectIn, paused, router])

  const skipToTools = () => {
    router.push('/tools')
  }

  const cancelAutoRedirect = () => {
    setPaused(true)
  }

  const progressPct = Math.max(
    0,
    Math.min(100, ((AUTO_REDIRECT_SECONDS - redirectIn) / AUTO_REDIRECT_SECONDS) * 100),
  )

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

        {/* Auto-redirect countdown UI */}
        {!paused && redirectIn > 0 && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 rounded-lg border border-[#E07A5F]/20 bg-[#E07A5F]/5 p-4"
          >
            <div className="flex items-center justify-between text-sm text-foreground-primary">
              <span>
                Redirecting to your tools in <strong>{redirectIn}s</strong>…
              </span>
              <button
                type="button"
                onClick={cancelAutoRedirect}
                className="text-xs text-foreground-muted hover:text-foreground-primary underline"
              >
                Cancel
              </button>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#E07A5F]/10">
              <div
                className="h-full bg-[#E07A5F] transition-all duration-1000 ease-linear"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={skipToTools}
            className="block w-full py-3 px-4 text-center font-medium rounded-lg bg-[#E07A5F] text-white hover:bg-[#d46a50] transition-colors"
          >
            Skip → Start using Pro tools now
          </button>
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

        {paused && (
          <p className="mt-4 text-xs text-foreground-muted">
            Auto-redirect cancelled. Click <em>Skip</em> above whenever you're ready.
          </p>
        )}
      </div>
    </div>
  )
}
