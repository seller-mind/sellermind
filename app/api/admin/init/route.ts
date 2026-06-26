import { NextRequest, NextResponse } from 'next/server'

// /api/admin/init  — one-off Supabase table sanity check
//
// P0-D fix (2026-06-26):
//   Previously authenticated against `process.env.CREEM_WEBHOOK_SECRET`.
//   After the Creem→Dodo migration (2026-06-15) that env var is still
//   present in Vercel (legacy fallback for the deprecated creem webhook
//   replay sink), but its semantic meaning is "Creem webhook signing
//   key", not "admin init auth". If anyone removed it, the strict
//   inequality `undefined !== undefined` becomes `false`, and any
//   unauthenticated POST would have bypassed auth and reached the
//   downstream supabase check — which in turn leaked the full sellermind
//   schema in its error response.
//
//   We now:
//     1. Require a dedicated `ADMIN_INIT_SECRET` env (with a non-empty
//        check so an unset var fails closed, not open).
//     2. Use a constant-time compare to avoid timing oracles.
//     3. Stop returning the raw CREATE TABLE SQL on error — it was
//        enumerating every internal column name (incl. creem_*/dodo_*
//        ids) and giving attackers free reconnaissance.

import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function timingSafeStringEqual(a: string, b: string): boolean {
  // Defence against length-leak side channel by hashing both sides first.
  const ha = crypto.createHash('sha256').update(a).digest()
  const hb = crypto.createHash('sha256').update(b).digest()
  return crypto.timingSafeEqual(ha, hb)
}

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_INIT_SECRET
  // Fail closed: if the env var is missing/empty in this environment, we
  // refuse the call rather than treat both sides as `undefined` (which
  // would silently authenticate).
  if (!expected || expected.length < 16) {
    return NextResponse.json({ error: 'Admin endpoint disabled' }, { status: 503 })
  }

  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : ''
  if (!token || !timingSafeStringEqual(token, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: checkError } = await supabase
      .from('sellermind_users')
      .select('email')
      .limit(1)

    if (!checkError) {
      return NextResponse.json({ message: 'Table already exists', status: 'ok' })
    }

    // Schema-enumeration hardening: never echo the CREATE TABLE SQL.
    // Operator should pull the SQL from `migrations/` in the repo, not
    // from a public production endpoint.
    return NextResponse.json(
      {
        error: 'Required table is missing. Apply migrations/init_sellermind_users.sql via the Supabase Dashboard SQL editor.',
        status: 'needs_manual_setup',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Init failed' }, { status: 500 })
  }
}

// Explicit GET handler so accidental browser hits don't leak the route's
// existence with a generic Next 404 page — and so monitoring won't flag
// this route as broken. Returns 405 + Allow header per RFC 7231 §6.5.5.
export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  )
}
