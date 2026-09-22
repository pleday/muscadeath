-- Run this once in the Supabase SQL editor, in addition to schema.sql.
-- Stores completed orders (written only by the stripe-webhook and
-- mock-checkout Edge Functions, using the service role key which bypasses
-- RLS). Only the signed-in admin can read/manage them (used by the
-- "Gestion des ventes" tab).

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  -- Set once a refund has been requested via Stripe (null for mock orders).
  payment_intent_id text,
  customer_email text,
  -- Total amount actually paid, in cents, to avoid floating point issues.
  amount_total integer not null,
  currency text not null default 'eur',
  items jsonb not null,
  -- 'pending': just paid, not prepared yet. 'processed': ready/handed out at
  -- the merch stand. 'refunded': money returned to the customer.
  status text not null default 'pending' check (status in ('pending', 'processed', 'refunded')),
  created_at timestamptz not null default now()
);

-- Migration for databases created before `status` / `payment_intent_id` existed.
alter table public.orders add column if not exists payment_intent_id text;
alter table public.orders add column if not exists status text not null default 'pending';
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('pending', 'processed', 'refunded'));

alter table public.orders enable row level security;

-- Only the admin (signed in) can list orders for the sales management tab.
drop policy if exists "authenticated can read orders" on public.orders;
create policy "authenticated can read orders"
  on public.orders
  for select
  using (auth.role() = 'authenticated');

-- Only the admin (signed in) can update an order's status (mark as
-- processed / refunded). Amounts and items stay set only by the Edge
-- Functions (service role), never by this policy.
drop policy if exists "authenticated can update orders" on public.orders;
create policy "authenticated can update orders"
  on public.orders
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- No insert policy is granted to the anon or authenticated role: orders are
-- only ever inserted by the stripe-webhook / mock-checkout Edge Functions
-- using the service role key, which bypasses Row Level Security entirely.

