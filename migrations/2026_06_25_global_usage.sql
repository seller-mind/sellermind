-- Migration: sellermind_global_usage
-- Purpose: persisted daily-aggregate counter so applyPreUsageChecks() can enforce
--          a global DeepSeek call cap across all Vercel function instances.
--
-- Apply in Supabase SQL Editor (one-off):
--   1. Open https://supabase.com/dashboard/project/sdeduzqplvsyttvnolxm/sql
--   2. Paste this entire file and Run.
--
-- Without this table the cap degrades to per-instance in-memory only (still safe,
-- just less precise: effective cap = GLOBAL_DAILY_CAP * active_function_instances).

create table if not exists public.sellermind_global_usage (
  day date primary key,
  count integer not null default 0,
  updated_at timestamptz not null default now()
);

-- RLS off (service-role only).
alter table public.sellermind_global_usage enable row level security;

-- Allow the service role to read/write; deny all anon access.
drop policy if exists "service role full access" on public.sellermind_global_usage;
create policy "service role full access"
  on public.sellermind_global_usage
  for all
  to service_role
  using (true)
  with check (true);

-- Optional housekeeping: prune rows older than 90 days.
-- (Run manually or schedule via Supabase cron later.)
-- delete from public.sellermind_global_usage where day < (current_date - 90);
