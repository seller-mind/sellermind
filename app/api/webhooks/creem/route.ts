// app/api/webhooks/creem/route.ts
//
// ⚠️ 兜底降级版本（2026-06-15 切 Dodo Payments 时改造）：
//
// 历史：sellermind 原本走 Creem 收款，2026-06-10 Creem 账户被永久封禁，
//      2026-06-15 切到 Dodo Payments（live mode 已上线）。
// 当前角色：本路由保留至 2026-07-15（30 天兜底窗口），用于：
//   1. Creem 服务器若仍向本端点重发历史 retry 事件，给 200 防止 Creem 端无限重试堆积
//   2. 抓取 raw payload 落日志，方便事后人肉对账退款
//
// 严禁：
//   * 不要再删除本路由（30 天内）
//   * 不要再写 Supabase（用户订阅已 100% 由 Dodo webhook 接管）
//   * 不要再校验签名 —— Creem secret 仍在 env，但触发的写库副作用已不需要
//
// 30 天后（约 2026-07-15）操作：删本路由 + Vercel env 删 CREEM_*。
// 但 sellermind_users 表里 creem_* 三列**保留不动**（task 严禁删除，对账要查）。

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // 抓 raw body + 关键 header，落日志后直接 200
  const rawBody = await request.text().catch(() => '')
  const sig = request.headers.get('creem-signature') || ''
  const ua = request.headers.get('user-agent') || ''

  let eventType = ''
  let eventId = ''
  let email = ''
  try {
    if (rawBody) {
      const parsed = JSON.parse(rawBody)
      eventType = parsed?.eventType || parsed?.type || ''
      eventId = parsed?.id || parsed?.object?.id || parsed?.data?.id || ''
      email =
        parsed?.metadata?.email ||
        parsed?.object?.metadata?.email ||
        parsed?.data?.metadata?.email ||
        parsed?.customer?.email ||
        parsed?.object?.customer?.email ||
        ''
    }
  } catch {
    // ignore parse failures, still log raw size
  }

  console.log(
    '[creem-webhook-fallback]',
    JSON.stringify({
      eventType,
      eventId,
      email,
      ua,
      hasSig: !!sig,
      bodyBytes: rawBody.length,
      ts: new Date().toISOString(),
      note: 'Creem migrated to Dodo on 2026-06-15; this is a 30d no-op sink',
    }),
  )

  // 200 防止 Creem 端无限重试
  return NextResponse.json({ received: true, deprecated: true })
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: '/api/webhooks/creem',
    deprecated: true,
    note: 'Sellermind switched to Dodo Payments on 2026-06-15. This endpoint is a 30-day no-op sink and will be removed around 2026-07-15.',
  })
}
