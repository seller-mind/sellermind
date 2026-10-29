// app/api/webhooks/creem/route.ts
//
// SM-06 fix (2026-10-28 QA): this route was documented as a "30-day no-op sink
// to be removed around 2026-07-15". On 2026-10-28 it was still answering 200
// with a JSON body, i.e. ~3.5 months past its own removal date.
//
// History: Sellermind collected payments via Creem until 2026-06-10, when the
// Creem account was permanently banned. Billing moved to Dodo Payments on
// 2026-06-15 and the Dodo webhook owns 100% of subscription state since then.
// The sink existed only so Creem's own retry queue would drain instead of
// hammering us for weeks.
//
// That window closed long ago. Answering 200 on a dead payment endpoint is
// pure attack surface: it is unauthenticated, it accepts arbitrary JSON bodies,
// and any 200 tells a scanner "this looks like a live payment receiver".
// Returning 410 Gone is the correct end state — Creem's retry logic treats it
// as permanently gone and stops, and scanners get nothing back.
//
// If Creem ever needs to be reconciled again, read the creem_* columns on
// sellermind_users (kept for audit, do NOT drop) and the historical logs.
// Do not resurrect this route.

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GONE = {
  ok: false,
  error: 'gone',
  note: 'Sellermind moved to Dodo Payments on 2026-06-15. The Creem webhook was retired on 2026-07-15 and no longer accepts events.',
}

export async function POST() {
  return NextResponse.json(GONE, { status: 410 })
}

export async function GET() {
  return NextResponse.json(GONE, { status: 410 })
}
