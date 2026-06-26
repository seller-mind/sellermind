-- Migration: init_sellermind_users
-- Purpose: source-of-truth schema for the per-user freemium / subscription table.
--          Referenced by app/api/admin/init/route.ts after the P0-D
--          (2026-06-26) fix that stopped echoing this SQL over a public
--          endpoint. Operator must apply manually via Supabase SQL Editor.
--
-- Apply once (one-off):
--   1. Open https://supabase.com/dashboard/project/sdeduzqplvsyttvnolxm/sql
--   2. Paste this entire file and Run.
--
-- Idempotent: safe to re-run; uses IF NOT EXISTS everywhere.

CREATE TABLE IF NOT EXISTS sellermind_users (
  email TEXT PRIMARY KEY,
  subscription_status TEXT DEFAULT 'free',
  subscription_plan TEXT,
  monthly_count INT DEFAULT 0,
  monthly_reset_date TIMESTAMPTZ,
  total_lifetime_count INT DEFAULT 0,
  -- Legacy Creem fields — retained for historical reconciliation only
  -- (Creem account permanently banned 2026-06-10, migrated to Dodo
  -- 2026-06-15). DO NOT drop these columns, refund accounting still
  -- needs them per Haimo task ledger.
  creem_customer_id TEXT,
  creem_subscription_id TEXT,
  creem_checkout_id TEXT,
  -- Current payment provider (Dodo Payments)
  payment_provider TEXT DEFAULT 'dodo',
  dodo_customer_id TEXT,
  dodo_subscription_id TEXT,
  dodo_checkout_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sellermind_users ENABLE ROW LEVEL SECURITY;

-- Service-role only access — no anon read/write. Frontend never queries
-- this table directly; all access flows through /api/usage (POST) and
-- /api/webhooks/dodo using the Supabase service-role key.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sellermind_users'
      AND policyname = 'service_role_full_access'
  ) THEN
    CREATE POLICY service_role_full_access ON sellermind_users
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
