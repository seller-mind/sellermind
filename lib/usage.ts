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

// ============================================================
// Payment-provider 兼容辅助（2026-06-15 Dodo 迁移）
//
// 历史：所有用户解析靠 `email`（webhook 入库时带 email，前端 localStorage 也按 email 跟踪）。
// Dodo 切换后：webhook 给的 customer_id 是 Dodo 自家的 cus_xxx；旧 Creem 老订阅 30 天兜底窗口内
// 仍可能有事件带 Creem 的 cus_xxx 反查（极少数情况，如手动退款对账）。
//
// 设计：以下函数严格按"先 dodo_customer_id，再 creem_customer_id"的顺序回查用户。
// 业务主链路（usage.ts 上方的 checkAndIncrementUsage / getUsageInfo / getSubscriptionStatus）
// 仍走 email；这些 helper 仅在运营/退款排障时按 customer_id 反查会用到。
// ============================================================

export interface UserRow {
  email: string
  subscription_status: string | null
  subscription_plan: string | null
  current_period_end: string | null
  payment_provider?: string | null
  dodo_customer_id?: string | null
  creem_customer_id?: string | null
  [k: string]: unknown
}

/**
 * 按 customer_id 回查 sellermind_users。先按 dodo_customer_id 命中，
 * 再 fallback 到 creem_customer_id（30 天兜底窗口内仍可能命中）。
 * 列若不存在（migration 未跑），自动跳过那一步而不抛异常。
 */
export async function resolveUserByCustomerId(
  customerId: string,
): Promise<UserRow | null> {
  if (!customerId) return null
  // 先 Dodo
  try {
    const { data, error } = await supabaseAdmin
      .from('sellermind_users')
      .select('*')
      .eq('dodo_customer_id', customerId)
      .maybeSingle()
    if (!error && data) return data as UserRow
  } catch {
    // dodo_customer_id 列还没加（migration 未跑）；安静降级
  }
  // 再 Creem
  try {
    const { data, error } = await supabaseAdmin
      .from('sellermind_users')
      .select('*')
      .eq('creem_customer_id', customerId)
      .maybeSingle()
    if (!error && data) return data as UserRow
  } catch {
    // creem 列向来在；理论不会进这里
  }
  return null
}

/**
 * 按 email 回查并附带支付渠道信息。
 * 优先返回 dodo_customer_id，次之 creem_customer_id；payment_provider 优先取行内字段，
 * 缺失时按 customer_id 哪一边有值反推（dodo > creem > unknown）。
 */
export async function getCustomerLinkByEmail(email: string): Promise<{
  dodoCustomerId: string | null
  creemCustomerId: string | null
  preferredCustomerId: string | null
  paymentProvider: 'dodo' | 'creem' | 'unknown'
}> {
  const empty = {
    dodoCustomerId: null,
    creemCustomerId: null,
    preferredCustomerId: null,
    paymentProvider: 'unknown' as const,
  }
  if (!email) return empty
  const { data: user } = await supabaseAdmin
    .from('sellermind_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle()
  if (!user) return empty

  const dodoCustomerId =
    typeof (user as Record<string, unknown>).dodo_customer_id === 'string'
      ? ((user as Record<string, unknown>).dodo_customer_id as string)
      : null
  const creemCustomerId =
    typeof (user as Record<string, unknown>).creem_customer_id === 'string'
      ? ((user as Record<string, unknown>).creem_customer_id as string)
      : null
  const declaredProviderRaw = (user as Record<string, unknown>).payment_provider
  const declaredProvider =
    typeof declaredProviderRaw === 'string' ? declaredProviderRaw : null

  let provider: 'dodo' | 'creem' | 'unknown' = 'unknown'
  if (declaredProvider === 'dodo' || declaredProvider === 'creem') {
    provider = declaredProvider
  } else if (dodoCustomerId) {
    provider = 'dodo'
  } else if (creemCustomerId) {
    provider = 'creem'
  }

  return {
    dodoCustomerId,
    creemCustomerId,
    preferredCustomerId: dodoCustomerId || creemCustomerId,
    paymentProvider: provider,
  }
}

