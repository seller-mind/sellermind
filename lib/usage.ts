import { auth, clerkClient } from '@clerk/nextjs/server'

const FREE_LIMIT = 3

interface UsageData {
  monthlyCount: number
  monthlyResetDate: string
  totalLifetimeCount: number
  refundCount: number
  hasUsedRefund: boolean
  refundLockoutUntil: string | null
}

function getDefaultUsage(): UsageData {
  const now = new Date()
  return {
    monthlyCount: 0,
    monthlyResetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    totalLifetimeCount: 0,
    refundCount: 0,
    hasUsedRefund: false,
    refundLockoutUntil: null,
  }
}

function isMonthExpired(resetDate: string): boolean {
  return new Date() >= new Date(resetDate)
}

export async function checkAndIncrementUsage(): Promise<{
  allowed: boolean
  remaining: number
  totalUsed: number
  isSubscribed: boolean
}> {
  const { userId } = auth()
  if (!userId) return { allowed: false, remaining: 0, totalUsed: 0, isSubscribed: false }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  
  const isSubscribed = user.privateMetadata?.subscriptionStatus === 'active'
  if (isSubscribed) {
    return { allowed: true, remaining: -1, totalUsed: -1, isSubscribed: true }
  }

  let usage = (user.privateMetadata?.usage as UsageData) || getDefaultUsage()
  
  if (isMonthExpired(usage.monthlyResetDate)) {
    usage.monthlyCount = 0
    const now = new Date()
    usage.monthlyResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
  }

  if (usage.refundLockoutUntil && new Date() < new Date(usage.refundLockoutUntil)) {
    return { allowed: false, remaining: 0, totalUsed: usage.totalLifetimeCount, isSubscribed: false }
  }

  if (usage.monthlyCount >= FREE_LIMIT) {
    return { allowed: false, remaining: 0, totalUsed: usage.monthlyCount, isSubscribed: false }
  }

  usage.monthlyCount++
  usage.totalLifetimeCount++
  
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { usage },
  })

  return { 
    allowed: true, 
    remaining: FREE_LIMIT - usage.monthlyCount, 
    totalUsed: usage.monthlyCount, 
    isSubscribed: false 
  }
}

export async function getUsageInfo(): Promise<{
  remaining: number
  totalUsed: number
  isSubscribed: boolean
  freeLimit: number
}> {
  const { userId } = auth()
  if (!userId) return { remaining: 0, totalUsed: 0, isSubscribed: false, freeLimit: FREE_LIMIT }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  
  const isSubscribed = user.privateMetadata?.subscriptionStatus === 'active'
  if (isSubscribed) return { remaining: -1, totalUsed: -1, isSubscribed: true, freeLimit: FREE_LIMIT }

  let usage = (user.privateMetadata?.usage as UsageData) || getDefaultUsage()
  if (isMonthExpired(usage.monthlyResetDate)) {
    usage.monthlyCount = 0
  }

  return { 
    remaining: Math.max(0, FREE_LIMIT - usage.monthlyCount), 
    totalUsed: usage.monthlyCount, 
    isSubscribed: false, 
    freeLimit: FREE_LIMIT 
  }
}
