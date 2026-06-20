// app/api/webhooks/dodo/route.ts
//
// Dodo Payments webhook endpoint - sellermind 项目
// 切 Dodo 后的主收款回调入口，与旧 app/api/webhooks/creem/route.ts 并排（旧 route 保留 30 天兜底）。
//
// Standard Webhooks 签名规范实现：
//   header webhook-id / webhook-signature / webhook-timestamp
//   sig = base64(HMAC-SHA256(base64decode(secret), "{webhook-id}.{webhook-timestamp}.{raw_body}"))
//   header value 格式 "v1,<base64sig>" 可有多个 v1 用空格分隔
//   5 分钟 timestamp 防重放
//   raw bytes 不可 parse JSON 后再签
//
// env：
//   DODO_WEBHOOK_SECRET     必填，Dodo Dashboard webhook endpoint 创建时获得，形如 whsec_xxxx
//   DODO_PRODUCT_ID_MONTHLY 可选，配了就只处理 sellermind 自家 product，避免 brand 共享 webhook 被串
//   DODO_PRODUCT_ID_YEARLY  同上
//
// 设计要点：
//   1. 零外部依赖，Node 内置 crypto 实现 Standard Webhooks 验签
//   2. 多 header 名 fallback：webhook-* 主，dodo-*/x-dodo-* 备（防止 header 大小写/前缀差异）
//   3. payload 双 shape 兼容：event.type vs event.eventType / event.data vs event.object
//   4. 列级降级：dodo_* 三列与 payment_provider 若 Supabase 还没加，自动剥离这些字段重写
//      （这是兜底；正确做法是先跑 ./migrations/add_dodo_columns.sql）
//   5. 5 分钟时间戳容忍 = Standard Webhooks 默认；过期 → 401 让 Dodo 重试

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ============================================================
// Standard Webhooks 签名校验
// ============================================================

const TOLERANCE_SECONDS = 5 * 60

function decodeWebhookSecret(secret: string): Buffer {
  // Standard Webhooks: whsec_ 后面那段是 base64-encoded raw key
  const raw = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret
  const buf = Buffer.from(raw, 'base64')
  if (buf.length === 0 && raw.length > 0) return Buffer.from(raw, 'utf8')
  return buf
}

function pickHeader(req: NextRequest, candidates: string[]): string | null {
  for (const name of candidates) {
    const v = req.headers.get(name)
    if (v) return v
  }
  return null
}

function readWebhookHeaders(req: NextRequest): {
  id: string | null
  timestamp: string | null
  signature: string | null
} {
  return {
    id: pickHeader(req, ['webhook-id', 'dodo-webhook-id', 'x-dodo-webhook-id']),
    timestamp: pickHeader(req, [
      'webhook-timestamp',
      'dodo-webhook-timestamp',
      'x-dodo-webhook-timestamp',
    ]),
    signature: pickHeader(req, [
      'webhook-signature',
      'dodo-signature',
      'x-dodo-signature',
      'x-dodo-webhook-signature',
    ]),
  }
}

function verifyDodoSignature(opts: {
  rawBody: string
  webhookId: string
  webhookTimestamp: string
  webhookSignature: string
  secret: string
}): { ok: boolean; reason?: string } {
  const { rawBody, webhookId, webhookTimestamp, webhookSignature, secret } = opts

  const ts = parseInt(webhookTimestamp, 10)
  if (!Number.isFinite(ts)) return { ok: false, reason: 'bad_timestamp' }
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - ts) > TOLERANCE_SECONDS) return { ok: false, reason: 'expired' }

  const signedPayload = `${webhookId}.${webhookTimestamp}.${rawBody}`
  const expected = crypto
    .createHmac('sha256', decodeWebhookSecret(secret))
    .update(signedPayload)
    .digest('base64')

  // header value: "v1,<sig1> v1,<sig2>"
  const candidates = webhookSignature.split(/\s+/).filter(Boolean)
  for (const candidate of candidates) {
    const idx = candidate.indexOf(',')
    if (idx < 0) continue
    const version = candidate.slice(0, idx)
    const sig = candidate.slice(idx + 1)
    if (version !== 'v1') continue
    try {
      const a = Buffer.from(sig)
      const b = Buffer.from(expected)
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        return { ok: true }
      }
    } catch {
      // try next candidate
    }
  }
  return { ok: false, reason: 'mismatch' }
}

// ============================================================
// Supabase 写入：列级降级（dodo_* 列若没建，自动剥离重试一次）
// ============================================================

async function upsertSellermindUser(
  payload: Record<string, any>,
  conflict: 'email' = 'email',
): Promise<{ ok: boolean; degradedKeys?: string[]; error?: string }> {
  const { error } = await supabaseAdmin
    .from('sellermind_users')
    .upsert(payload, { onConflict: conflict })
  if (!error) return { ok: true }

  // 检查是不是 column 不存在错误，剥离 dodo_* 与 payment_provider 后重试
  const msg = `${error.message} ${error.details ?? ''}`.toLowerCase()
  const looksLikeColumnMissing =
    msg.includes('column') &&
    (msg.includes('does not exist') ||
      msg.includes('not found') ||
      msg.includes('schema cache'))
  if (!looksLikeColumnMissing) {
    return { ok: false, error: error.message }
  }

  // 剥离潜在缺失列后重试
  const stripKeys = [
    'dodo_customer_id',
    'dodo_subscription_id',
    'dodo_checkout_id',
    'payment_provider',
  ]
  const degraded: Record<string, any> = { ...payload }
  const dropped: string[] = []
  for (const k of stripKeys) {
    if (k in degraded) {
      dropped.push(k)
      delete degraded[k]
    }
  }
  const retry = await supabaseAdmin
    .from('sellermind_users')
    .upsert(degraded, { onConflict: conflict })
  if (retry.error) return { ok: false, error: retry.error.message }
  return { ok: true, degradedKeys: dropped }
}

async function updateSellermindUserByEmail(
  email: string,
  patch: Record<string, any>,
): Promise<{ ok: boolean; degradedKeys?: string[]; error?: string }> {
  const { error } = await supabaseAdmin
    .from('sellermind_users')
    .update(patch)
    .eq('email', email)
  if (!error) return { ok: true }

  const msg = `${error.message} ${error.details ?? ''}`.toLowerCase()
  const looksLikeColumnMissing =
    msg.includes('column') &&
    (msg.includes('does not exist') ||
      msg.includes('not found') ||
      msg.includes('schema cache'))
  if (!looksLikeColumnMissing) {
    return { ok: false, error: error.message }
  }

  const stripKeys = [
    'dodo_customer_id',
    'dodo_subscription_id',
    'dodo_checkout_id',
    'payment_provider',
  ]
  const degraded: Record<string, any> = { ...patch }
  const dropped: string[] = []
  for (const k of stripKeys) {
    if (k in degraded) {
      dropped.push(k)
      delete degraded[k]
    }
  }
  const retry = await supabaseAdmin
    .from('sellermind_users')
    .update(degraded)
    .eq('email', email)
  if (retry.error) return { ok: false, error: retry.error.message }
  return { ok: true, degradedKeys: dropped }
}

// ============================================================
// 路由 handler
// ============================================================

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[dodo-webhook] DODO_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    )
  }

  const { id: hookId, timestamp: hookTs, signature: hookSig } = readWebhookHeaders(request)
  if (!hookId || !hookTs || !hookSig) {
    console.warn(
      '[dodo-webhook] missing headers:',
      JSON.stringify({ hasId: !!hookId, hasTs: !!hookTs, hasSig: !!hookSig }),
    )
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
  }

  // ⚠️ 必须先读 raw text 用于验签；用 .json() 会丢失原始字节
  const rawBody = await request.text()

  const verify = verifyDodoSignature({
    rawBody,
    webhookId: hookId,
    webhookTimestamp: hookTs,
    webhookSignature: hookSig,
    secret: webhookSecret,
  })
  if (!verify.ok) {
    console.warn(`[dodo-webhook] signature reject: ${verify.reason}`)
    return NextResponse.json(
      { error: 'Invalid signature', reason: verify.reason },
      { status: 401 },
    )
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    // 双 shape 兼容
    const eventType: string = event.type || event.eventType || ''
    const eventData: any = event.data || event.object || event || {}

    // ---- product 过滤 ----
    const productId =
      eventData?.product_id ||
      eventData?.product?.id ||
      eventData?.product?.product_id ||
      eventData?.product_cart?.[0]?.product_id

    const sellerMindProductIds = [
      process.env.DODO_PRODUCT_ID_MONTHLY,
      process.env.DODO_PRODUCT_ID_YEARLY,
    ].filter(Boolean) as string[]

    if (
      productId &&
      sellerMindProductIds.length > 0 &&
      !sellerMindProductIds.includes(productId)
    ) {
      console.log(`[dodo-webhook] skipped: product ${productId} not in sellermind set`)
      return NextResponse.json({ received: true, skipped: true })
    }

    // ---- email 提取 ----
    const email: string | undefined =
      eventData?.metadata?.email ||
      eventData?.customer?.email ||
      eventData?.customer_email ||
      eventData?.custom_data?.email

    if (!email) {
      console.log('[dodo-webhook] No email in webhook data, skipping:', eventType)
      return NextResponse.json({ received: true })
    }

    const normalizedEmail = email.toLowerCase()
    const now = new Date().toISOString()

    // ---- 通用 ID 提取 ----
    const dodoCheckoutId: string | undefined =
      eventData?.session_id || eventData?.checkout_id || eventData?.id
    const dodoSubscriptionId: string | undefined =
      eventData?.subscription_id || eventData?.id
    const dodoCustomerId: string | undefined =
      eventData?.customer?.customer_id ||
      eventData?.customer?.id ||
      eventData?.customer_id
    const currentPeriodEnd: string | undefined =
      eventData?.next_billing_date ||
      eventData?.current_period_end ||
      eventData?.current_period_end_date ||
      eventData?.billing_period?.end

    const isMonthly = productId === process.env.DODO_PRODUCT_ID_MONTHLY
    const planName = isMonthly ? 'Pro Monthly' : 'Pro Yearly'

    // ============================================================
    // 事件分发
    // ============================================================

    let result: { ok: boolean; degradedKeys?: string[]; error?: string } = { ok: true }

    switch (eventType) {
      case 'subscription.active':
      case 'payment.succeeded': {
        result = await upsertSellermindUser({
          email: normalizedEmail,
          subscription_status: 'active',
          subscription_plan: planName,
          payment_provider: 'dodo',
          dodo_checkout_id: dodoCheckoutId,
          dodo_customer_id: dodoCustomerId,
          dodo_subscription_id: dodoSubscriptionId,
          current_period_end: currentPeriodEnd,
          updated_at: now,
        })
        console.log(`[dodo-webhook] ${eventType} for ${normalizedEmail}: ${planName}`)
        break
      }

      case 'subscription.renewed': {
        result = await updateSellermindUserByEmail(normalizedEmail, {
          subscription_status: 'active',
          payment_provider: 'dodo',
          current_period_end: currentPeriodEnd,
          dodo_subscription_id: dodoSubscriptionId,
          updated_at: now,
        })
        console.log(`[dodo-webhook] subscription renewed for ${normalizedEmail}`)
        break
      }

      case 'subscription.updated':
      case 'subscription.plan_changed': {
        result = await updateSellermindUserByEmail(normalizedEmail, {
          subscription_status: 'active',
          payment_provider: 'dodo',
          current_period_end: currentPeriodEnd,
          updated_at: now,
        })
        console.log(`[dodo-webhook] subscription updated for ${normalizedEmail}`)
        break
      }

      case 'subscription.cancelled':
      case 'subscription.cancellation_scheduled': {
        result = await updateSellermindUserByEmail(normalizedEmail, {
          subscription_status: 'cancelled',
          current_period_end: currentPeriodEnd || now,
          updated_at: now,
        })
        console.log(`[dodo-webhook] subscription cancelled for ${normalizedEmail}`)
        break
      }

      case 'subscription.expired': {
        result = await updateSellermindUserByEmail(normalizedEmail, {
          subscription_status: 'expired',
          updated_at: now,
        })
        console.log(`[dodo-webhook] subscription expired for ${normalizedEmail}`)
        break
      }

      case 'subscription.on_hold': {
        result = await updateSellermindUserByEmail(normalizedEmail, {
          subscription_status: 'paused',
          updated_at: now,
        })
        console.log(`[dodo-webhook] subscription on_hold for ${normalizedEmail}`)
        break
      }

      case 'subscription.failed': {
        result = await updateSellermindUserByEmail(normalizedEmail, {
          subscription_status: 'expired',
          updated_at: now,
        })
        console.warn(`[dodo-webhook] subscription failed for ${normalizedEmail}`)
        break
      }

      case 'refund.succeeded':
      case 'refund.failed': {
        console.log(
          `[dodo-webhook] ${eventType} for ${normalizedEmail}, sub=${dodoSubscriptionId}`,
        )
        break
      }

      case 'dispute.opened':
      case 'dispute.lost':
      case 'dispute.won': {
        console.log(`[dodo-webhook] ${eventType} for ${normalizedEmail}`)
        break
      }

      default:
        console.log('[dodo-webhook] Unhandled event:', eventType)
    }

    if (!result.ok) {
      console.error('[dodo-webhook] supabase write failed:', result.error)
    } else if (result.degradedKeys && result.degradedKeys.length > 0) {
      console.warn(
        `[dodo-webhook] supabase write degraded — missing columns ${JSON.stringify(
          result.degradedKeys,
        )}; please run migrations/add_dodo_columns.sql`,
      )
    }

    return NextResponse.json({
      received: true,
      degraded: result.degradedKeys && result.degradedKeys.length > 0,
    })
  } catch (error: any) {
    console.error('[dodo-webhook] processing error:', error?.message || error)
    // 业务异常返 200 给 Dodo 防止无限重试，日志保留事后排查
    return NextResponse.json({ received: true, processing_error: true })
  }
}

// 友好的 GET 探测：方便 Dashboard 配置 endpoint 后用浏览器 sanity-check
export async function GET() {
  return NextResponse.json({
    ok: true,
    route: '/api/webhooks/dodo',
    expects: 'POST with Standard Webhooks headers (webhook-id, webhook-timestamp, webhook-signature)',
  })
}
