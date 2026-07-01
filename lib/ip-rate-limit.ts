/**
 * Generic per-IP rate limit for non-AI routes (checkout / usage / admin).
 *
 * Backend: Upstash Redis REST API (same instance as lib/etsy-rate-limit.ts).
 *
 * Design notes:
 *   - IP is SHA-256-hashed before use as KV key (GDPR / rule #129 — prevents
 *     the KV from doubling as a "who-called-what" reverse index).
 *   - Fail-OPEN when Upstash is unconfigured OR unreachable. These 3 routes
 *     each have their own auth / budget / business-logic guardrails; this
 *     RL is defence-in-depth, not the sole gate. Failing closed here would
 *     take down checkout on any Upstash outage — unacceptable.
 *     (Contrast lib/etsy-rate-limit.ts which fails CLOSED because that's a
 *     public unauthenticated $0.20/day DeepSeek budget guardian.)
 *   - Uses `INCR` + `EXPIRE key window NX` pipeline for atomic single
 *     round-trip counting.
 *   - Adds standard `X-RateLimit-*` response headers on 429.
 *
 * Introduced 2026-07-01 to clear accepted-risk P2 from the 06-29 red-team
 * audit — 3 previously unprotected routes now IP-scoped.
 */

import { createHash } from 'crypto'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const KEY_PREFIX = 'sm_ip_rl:'

export interface IpRateLimitConfig {
  /** Route identifier — becomes part of the KV key so limits don't cross-contaminate. */
  scope: string
  /** Max requests within the window. */
  limit: number
  /** Window duration in seconds. */
  windowSec: number
}

export interface IpRateLimitDecision {
  allowed: boolean
  limit: number
  remaining: number
  resetSec: number
}

function upstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  )
}

async function upstashPipeline(
  cmds: (string | number)[][],
): Promise<unknown[] | null> {
  if (!upstashConfigured()) return null
  const url =
    process.env.UPSTASH_REDIS_REST_URL!.replace(/\/$/, '') + '/pipeline'
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cmds),
      signal: AbortSignal.timeout(2_000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as Array<{ result?: unknown; error?: string }>
    if (!Array.isArray(data)) return null
    if (data.some((d) => d && typeof d === 'object' && 'error' in d && d.error)) {
      return null
    }
    return data.map((d) => (d ? d.result : null))
  } catch {
    return null
  }
}

function extractIp(req: NextRequest | Request): string {
  const h = (name: string) => (req as Request).headers.get(name) || ''
  // Order: CF true-client-ip → x-forwarded-for first hop → x-real-ip → fallback
  const cfIp = h('cf-connecting-ip').trim()
  if (cfIp) return cfIp
  const xff = h('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const xri = h('x-real-ip').trim()
  if (xri) return xri
  return 'anonymous'
}

function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + ':sm_ip_rl_seed_v1')
    .digest('hex')
    .slice(0, 16)
}

function buildKey(scope: string, ip: string, windowSec: number): string {
  // Include window bucket in key so counter naturally resets each window.
  const bucket = Math.floor(Date.now() / 1000 / windowSec)
  return `${KEY_PREFIX}${scope}:${bucket}:${hashIp(ip)}`
}

/**
 * Check + increment the counter atomically. Returns the decision.
 *
 * Fail-OPEN: if Upstash is unconfigured or unreachable, returns
 * { allowed: true, remaining: limit-1, resetSec: windowSec } so the caller
 * proceeds. See design notes above.
 */
export async function checkIpRateLimit(
  req: NextRequest | Request,
  cfg: IpRateLimitConfig,
): Promise<IpRateLimitDecision> {
  const ip = extractIp(req)
  const key = buildKey(cfg.scope, ip, cfg.windowSec)

  if (!upstashConfigured()) {
    return {
      allowed: true,
      limit: cfg.limit,
      remaining: cfg.limit - 1,
      resetSec: cfg.windowSec,
    }
  }

  // Pipeline: INCR key ; EXPIRE key windowSec NX
  //   INCR returns the new count.
  //   EXPIRE NX only sets TTL on the first hit of the bucket (bucket key
  //   makes this deterministic — a fresh bucket starts at count=1).
  const results = await upstashPipeline([
    ['INCR', key],
    ['EXPIRE', key, String(cfg.windowSec), 'NX'],
  ])

  if (!results || results.length < 1) {
    // Fail-open on transport error.
    return {
      allowed: true,
      limit: cfg.limit,
      remaining: cfg.limit - 1,
      resetSec: cfg.windowSec,
    }
  }

  const rawCount = results[0]
  const count =
    typeof rawCount === 'number'
      ? rawCount
      : typeof rawCount === 'string'
        ? Number(rawCount)
        : NaN
  if (!Number.isFinite(count)) {
    return {
      allowed: true,
      limit: cfg.limit,
      remaining: cfg.limit - 1,
      resetSec: cfg.windowSec,
    }
  }

  const remaining = Math.max(0, cfg.limit - count)
  // resetSec: seconds until the next window bucket boundary.
  const nowSec = Math.floor(Date.now() / 1000)
  const resetSec = cfg.windowSec - (nowSec % cfg.windowSec)

  return {
    allowed: count <= cfg.limit,
    limit: cfg.limit,
    remaining,
    resetSec,
  }
}

/**
 * Build a 429 NextResponse from a rejected decision. Standard rate-limit
 * headers so proxies / clients can honor them without parsing the JSON body.
 */
export function buildRateLimitResponse(
  decision: IpRateLimitDecision,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Please retry in ${decision.resetSec}s.`,
        retry_after_seconds: decision.resetSec,
      },
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(decision.resetSec),
        'X-RateLimit-Limit': String(decision.limit),
        'X-RateLimit-Remaining': String(decision.remaining),
        'X-RateLimit-Reset': String(decision.resetSec),
        'Cache-Control': 'no-store',
      },
    },
  )
}

/**
 * Attach the standard X-RateLimit-* headers to a success response, so the
 * caller can see how many calls it has left without waiting to be throttled.
 */
export function withRateLimitHeaders(
  res: NextResponse,
  decision: IpRateLimitDecision,
): NextResponse {
  res.headers.set('X-RateLimit-Limit', String(decision.limit))
  res.headers.set('X-RateLimit-Remaining', String(decision.remaining))
  res.headers.set('X-RateLimit-Reset', String(decision.resetSec))
  return res
}
