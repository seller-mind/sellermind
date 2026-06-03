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

    fetch(`/api/usage?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(setUsageInfo)
      .catch(() => setUsageInfo(null))
  }, [])

  // Don't render if no usage info or user is subscribed
  if (!usageInfo || usageInfo.isSubscribed) return null

  if (usageInfo.remaining === 0) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <p className="text-sm text-amber-800 text-center">
          <span className="font-medium">You&apos;ve used your {usageInfo.freeLimit} free AI uses this month.</span>{' '}
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
          You have <span className="font-bold">{usageInfo.remaining}</span> free use{usageInfo.remaining !== 1 ? 's' : ''} remaining this month.{' '}
          <Link href="/pricing" className="underline hover:text-blue-600">
            Get unlimited access →
          </Link>
        </p>
      </div>
    )
  }

  return null
}
