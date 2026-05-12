'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { isClerkConfigured } from '@/lib/clerk-helpers'

interface UsageInfo {
  remaining: number
  totalUsed: number
  isSubscribed: boolean
  freeLimit: number
}

interface UserHook {
  isSignedIn: boolean | null;
  isLoaded: boolean;
}

export function UsageBanner() {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);

  useEffect(() => {
    // Check if Clerk is configured and load useUser hook
    if (!isClerkConfigured()) {
      setIsLoaded(true);
      setIsSignedIn(null);
      return;
    }

    import('@clerk/nextjs').then(({ useUser }) => {
      // Subscribe to user state changes
      const unsubscribe = useUser.subscribe((user: UserHook) => {
        setIsSignedIn(user.isSignedIn);
        setIsLoaded(user.isLoaded);
      });
      
      // Initial check
      const initialUser = useUser.getState();
      setIsSignedIn(initialUser.isSignedIn);
      setIsLoaded(initialUser.isLoaded);

      return () => unsubscribe();
    }).catch(() => {
      setIsLoaded(true);
      setIsSignedIn(null);
    });
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/usage')
        .then(res => res.json())
        .then(setUsageInfo)
        .catch(() => setUsageInfo({ remaining: 0, totalUsed: 0, isSubscribed: false, freeLimit: 3 }))
    }
  }, [isSignedIn])

  // Don't render if Clerk is not configured or user is not signed in
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
