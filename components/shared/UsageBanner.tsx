'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface UsageInfo {
  remaining: number
  totalUsed: number
  isSubscribed: boolean
  freeLimit: number
}

export function UsageBanner() {
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null)

  useEffect(() => {
    // Get email from localStorage
    const email = localStorage.getItem('sellermind_email')
    if (!email) return

    // P0-C fix (2026-06-26): POST instead of GET so the email never enters
    // the URL → Vercel access logs / CF analytics / browser history / Referer.
    // Body is JSON; server (app/api/usage/route.ts) rejects any ?email= query.
    fetch('/api/usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Hint to any intermediate CDN to bypass cache for this per-user call.
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({ email }),
      // Don't send cookies on this internal anon endpoint — email is the key.
      credentials: 'same-origin',
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && typeof data.remaining === 'number') {
          setUsageInfo(data)
        } else {
          setUsageInfo(null)
        }
      })
      .catch(() => setUsageInfo(null))
  }, [])

  // Don't render if no usage info or user is subscribed
  if (!usageInfo || usageInfo.isSubscribed) return null

  if (usageInfo.remaining === 0) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <p className="text-sm text-amber-800 text-center">
          <span className="font-medium">You&apos;ve used all {usageInfo.freeLimit} free AI uses this month.</span>{' '}
          Free uses reset on the 1st of each month.{' '}
          <Link href="/pricing" className="underline hover:text-amber-600">
            Upgrade to Pro for unlimited access →
          </Link>
        </p>
      </div>
    )
  }

  if (usageInfo.remaining <= 1) {
    return (
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <p className="text-sm text-blue-700 text-center">
          You have <span className="font-bold">{usageInfo.remaining}</span> of {usageInfo.freeLimit} free AI use{usageInfo.remaining !== 1 ? 's' : ''} left this month (resets on the 1st).{' '}
          <Link href="/pricing" className="underline hover:text-blue-600">
            Get unlimited access →
          </Link>
        </p>
      </div>
    )
  }

  // Supplementary P1 (2026-06-26): always surface the freemium rule for
  // logged-in free users so they understand the 3/month cap before they
  // hit it — also fulfils the "显眼位置写清楚" requirement. Lower-key
  // tone (slate, single line) to avoid hurting happy-path UX.
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
      <p className="text-xs text-slate-600 text-center">
        Free plan: <span className="font-medium">{usageInfo.remaining} of {usageInfo.freeLimit}</span> AI uses left this month · resets on the 1st ·{' '}
        <Link href="/pricing" className="underline hover:text-slate-900">
          See Pro plans
        </Link>
      </p>
    </div>
  )
}
