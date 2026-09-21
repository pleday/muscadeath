-- Run this once in the Supabase SQL editor, in addition to schema.sql.
-- Stores completed orders (written only by the stripe-webhook Edge Function,
-- using the service role key which bypasses RLS). Only the signed-in admin
-- can read them (used by the "Statistiques" tab).

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  customer_email text,
  -- Total amount actually paid, in cents, to avoid floating point issues.
  amount_total integer not null,
  currency text not null default 'eur',
  items jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Only the admin (signed in) can list orders for the statistics tab.
create policy "authenticated can read orders"
  on public.orders
  for select
  using (auth.role() = 'authenticated');

-- No insert/select policy is granted to the anon role: orders are only ever
-- inserted by the stripe-webhook Edge Function using the service role key,
-- which bypasses Row Level Security entirely.
