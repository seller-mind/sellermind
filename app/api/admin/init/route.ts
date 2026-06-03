import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (token !== process.env.CREEM_WEBHOOK_SECRET) {
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

    return NextResponse.json({ 
      error: 'Table does not exist. Create it in Supabase Dashboard SQL Editor with this SQL:',
      sql: "CREATE TABLE IF NOT EXISTS sellermind_users (email TEXT PRIMARY KEY, subscription_status TEXT DEFAULT 'free', subscription_plan TEXT, monthly_count INT DEFAULT 0, monthly_reset_date TIMESTAMPTZ, total_lifetime_count INT DEFAULT 0, creem_customer_id TEXT, creem_subscription_id TEXT, creem_checkout_id TEXT, current_period_end TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()); ALTER TABLE sellermind_users ENABLE ROW LEVEL SECURITY;",
      status: 'needs_manual_setup'
    }, { status: 400 })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Init failed' }, { status: 500 })
  }
}
