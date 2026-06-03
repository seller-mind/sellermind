import { supabaseAdmin } from './supabase'

const FREE_LIMIT = 3

interface UsageData {
  monthly_count: number
  monthly_reset_date: string
  total_lifetime_count: number
  subscription_status: string
}

function getDefaultUsage(): UsageData {
  const now = new Date()
  return {
    monthly_count: 0,
    monthly_reset_date: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    total_lifetime_count: 0,
    subscription_status: 'free',
  }
}

function isMonthExpired(resetDate: string): boolean {
  return new Date() >= new Date(resetDate)
}

export async function checkAndIncrementUsage(email: string): Promise<{
  allowed: boolean
  remaining: number
  totalUsed: number
  isSubscribed: boolean
}> {
  if (!email) {
    return { allowed: false, remaining: 0, totalUsed: 0, isSubscribed: false }
  }

  try {
    const { data: user, error } = await supabaseAdmin
      .from('sellermind_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      // New user - create record
      const newUsage = getDefaultUsage()
      newUsage.monthly_count = 1
      newUsage.total_lifetime_count = 1

      await supabaseAdmin
        .from('sellermind_users')
        .upsert({
          email: email.toLowerCase(),
          monthly_count: newUsage.monthly_count,
          monthly_reset_date: newUsage.monthly_reset_date,
          total_lifetime_count: newUsage.total_lifetime_count,
          subscription_status: 'free',
        }, { onConflict: 'email' })

      return {
        allowed: true,
        remaining: FREE_LIMIT - 1,
        totalUsed: 1,
        isSubscribed: false,
      }
    }

    // Subscribed user = unlimited
    if (user.subscription_status === 'active') {
      return { allowed: true, remaining: -1, totalUsed: -1, isSubscribed: true }
    }

    // Check if monthly reset needed
    let monthlyCount = user.monthly_count || 0
    let resetDate = user.monthly_reset_date

    if (isMonthExpired(resetDate)) {
      monthlyCount = 0
      const now = new Date()
      resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
    }

    // Check limit
    if (monthlyCount >= FREE_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        totalUsed: monthlyCount,
        isSubscribed: false,
      }
    }

    // Increment usage
    const newMonthlyCount = monthlyCount + 1
    const newTotalCount = (user.total_lifetime_count || 0) + 1

    await supabaseAdmin
      .from('sellermind_users')
      .update({
        monthly_count: newMonthlyCount,
        monthly_reset_date: resetDate,
        total_lifetime_count: newTotalCount,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase())

    return {
      allowed: true,
      remaining: FREE_LIMIT - newMonthlyCount,
      totalUsed: newMonthlyCount,
      isSubscribed: false,
    }
  } catch (error) {
    console.error('Usage check error:', error)
    // On error, allow usage to avoid blocking users
    return { allowed: true, remaining: -1, totalUsed: 0, isSubscribed: false }
  }
}

export async function getUsageInfo(email: string): Promise<{
  remaining: number
  totalUsed: number
  isSubscribed: boolean
  freeLimit: number
}> {
  if (!email) {
    return { remaining: FREE_LIMIT, totalUsed: 0, isSubscribed: false, freeLimit: FREE_LIMIT }
  }

  try {
    const { data: user, error } = await supabaseAdmin
      .from('sellermind_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      return { remaining: FREE_LIMIT, totalUsed: 0, isSubscribed: false, freeLimit: FREE_LIMIT }
    }

    if (user.subscription_status === 'active') {
      return { remaining: -1, totalUsed: -1, isSubscribed: true, freeLimit: FREE_LIMIT }
    }

    let monthlyCount = user.monthly_count || 0
    if (isMonthExpired(user.monthly_reset_date)) {
      monthlyCount = 0
    }

    return {
      remaining: Math.max(0, FREE_LIMIT - monthlyCount),
      totalUsed: monthlyCount,
      isSubscribed: false,
      freeLimit: FREE_LIMIT,
    }
  } catch (error) {
    console.error('Get usage info error:', error)
    return { remaining: -1, totalUsed: 0, isSubscribed: false, freeLimit: FREE_LIMIT }
  }
}

export async function getSubscriptionStatus(email: string): Promise<{
  isSubscribed: boolean
  plan?: string
  currentPeriodEnd?: string
}> {
  if (!email) return { isSubscribed: false }

  try {
    const { data: user } = await supabaseAdmin
      .from('sellermind_users')
      .select('subscription_status, subscription_plan, current_period_end')
      .eq('email', email.toLowerCase())
      .single()

    if (!user || user.subscription_status !== 'active') {
      return { isSubscribed: false }
    }

    // Check if subscription has expired
    if (user.current_period_end && new Date(user.current_period_end) < new Date()) {
      // Subscription period ended, but status might not be updated yet
      return { isSubscribed: false }
    }

    return {
      isSubscribed: true,
      plan: user.subscription_plan,
      currentPeriodEnd: user.current_period_end,
    }
  } catch {
    return { isSubscribed: false }
  }
}
