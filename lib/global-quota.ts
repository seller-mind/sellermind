import { supabaseAdmin } from './supabase'

/**
 * Two-layer DeepSeek quota protection (2026-06-14, Y3).
 *
 * Layer 1 — In-memory IP rate limit (process-local Map):
 *   IP_HOURLY_LIMIT requests per hour, shared across all 5 SEO routes.
 *   Per-IP key, no per-route partitioning, so 5 routes collectively get
 *   IP_HOURLY_LIMIT/hour from any single client.
 *
 * Layer 2 — Site-wide daily quota persisted in Supabase:
 *   DAILY_GLOBAL_LIMIT total DeepSeek calls per local day,
 *   stored in `sellermind_users` under email = '__global_daily_quota__'.
 *   Resets at next local-midnight ISO timestamp.
 *
 * Both check functions are FAIL-OPEN on infrastructure errors (Supabase
 * down, network blip): we'd rather temporarily lose accounting than
 * 500 the user. Errors are console.error'd for ops visibility.
 *
 * Both functions INCREMENT-ON-CHECK semantics: calling them counts the
 * request, so the 5 SEO routes should call them exactly once per request,
 * placed immediately before the DeepSeek API call.
 */

// ============ Constants ============

export const DAILY_GLOBAL_LIMIT = 2000
export const IP_HOURLY_LIMIT = 5
const IP_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const GLOBAL_QUOTA_EMAIL = '__global_daily_quota__'

// ============ Layer 1: IP Rate Limit (in-memory) ============

const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function extractIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  return req.headers.get('x-real-ip') || 'unknown'
}

export function checkAndIncrementIpRateLimit(ip: string): {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
} {
  const now = Date.now()
  const entry = ipRateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    ipRateLimitMap.set(ip, { count: 1, resetTime: now + IP_WINDOW_MS })
    return {
      allowed: true,
      remaining: IP_HOURLY_LIMIT - 1,
      retryAfterSeconds: 0,
    }
  }

  if (entry.count >= IP_HOURLY_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetTime - now) / 1000)),
    }
  }

  entry.count += 1
  return {
    allowed: true,
    remaining: IP_HOURLY_LIMIT - entry.count,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetTime - now) / 1000)),
  }
}

// ============ Layer 2: Global Daily Quota (Supabase) ============

function getNextMidnightISO(): string {
  const next = new Date()
  next.setHours(24, 0, 0, 0) // local midnight tomorrow
  return next.toISOString()
}

function isExpired(resetDate: string | null | undefined): boolean {
  if (!resetDate) return true
  const t = new Date(resetDate).getTime()
  if (!Number.isFinite(t)) return true
  return Date.now() >= t
}

export async function checkAndIncrementGlobalQuota(): Promise<{
  allowed: boolean
  remaining: number
  resetAt: string
}> {
  const fallbackReset = getNextMidnightISO()

  try {
    const { data: row, error: selectError } = await supabaseAdmin
      .from('sellermind_users')
      .select('monthly_count, monthly_reset_date, total_lifetime_count')
      .eq('email', GLOBAL_QUOTA_EMAIL)
      .maybeSingle()

    if (selectError) {
      console.error('[global-quota] select failed, fail-open:', selectError)
      return { allowed: true, remaining: -1, resetAt: fallbackReset }
    }

    // First-time bootstrap: create the counter row at count=1.
    if (!row) {
      const resetAt = getNextMidnightISO()
      const { error: upsertError } = await supabaseAdmin
        .from('sellermind_users')
        .upsert(
          {
            email: GLOBAL_QUOTA_EMAIL,
            monthly_count: 1,
            monthly_reset_date: resetAt,
            total_lifetime_count: 1,
            subscription_status: 'system',
          },
          { onConflict: 'email' }
        )
      if (upsertError) {
        console.error('[global-quota] bootstrap upsert failed, fail-open:', upsertError)
        return { allowed: true, remaining: -1, resetAt: fallbackReset }
      }
      return {
        allowed: true,
        remaining: DAILY_GLOBAL_LIMIT - 1,
        resetAt,
      }
    }

    // Day rollover: zero out the daily counter and roll resetAt forward.
    let count = row.monthly_count || 0
    let resetAt = row.monthly_reset_date as string
    if (isExpired(resetAt)) {
      count = 0
      resetAt = getNextMidnightISO()
    }

    if (count >= DAILY_GLOBAL_LIMIT) {
      return { allowed: false, remaining: 0, resetAt }
    }

    const newCount = count + 1
    const newLifetime = (row.total_lifetime_count || 0) + 1

    const { error: updateError } = await supabaseAdmin
      .from('sellermind_users')
      .update({
        monthly_count: newCount,
        monthly_reset_date: resetAt,
        total_lifetime_count: newLifetime,
        updated_at: new Date().toISOString(),
      })
      .eq('email', GLOBAL_QUOTA_EMAIL)

    if (updateError) {
      console.error('[global-quota] update failed, fail-open:', updateError)
      return { allowed: true, remaining: -1, resetAt }
    }

    return {
      allowed: true,
      remaining: DAILY_GLOBAL_LIMIT - newCount,
      resetAt,
    }
  } catch (err) {
    console.error('[global-quota] unexpected error, fail-open:', err)
    return { allowed: true, remaining: -1, resetAt: fallbackReset }
  }
}

// ============ Response Builders (used by the 5 SEO routes) ============

export function rateLimitExceededBody(retryAfterSeconds: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60))
  return {
    success: false as const,
    error: {
      code: 'RATE_LIMIT_EXCEEDED' as const,
      message: `Too many requests. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      retryAfterSeconds,
    },
  }
}

export function dailyQuotaExceededBody(resetAt: string) {
  return {
    success: false as const,
    error: {
      code: 'DAILY_QUOTA_EXCEEDED' as const,
      message: 'Daily AI quota reached. Service will resume tomorrow.',
      resetAt,
    },
  }
}
