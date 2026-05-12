'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface UsageInfo {
  remaining: number
  totalUsed: number
  isSubscribed: boolean
  freeLimit: number
}

export function UsageBanner() {
  const { isSignedIn, isLoaded } = useUser()
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null)

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/usage')
        .then(res => res.json())
        .then(setUsageInfo)
        .catch(() => setUsageInfo({ remaining: 0, totalUsed: 0, isSubscribed: false, freeLimit: 3 }))
    }
  }, [isSignedIn])

  if (!isLoaded || !isSignedIn || !usageInfo || usageInfo.isSubscribed) return null

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
