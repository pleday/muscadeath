-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Stores the whole site content + theme as a single JSON row so the admin
-- panel can publish updates that every visitor immediately sees.

create table if not exists public.site_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seed the single row the app reads/writes (id = 'main').
insert into public.site_content (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.site_content enable row level security;

-- Anyone (including anonymous visitors) can read the published content.
create policy "public can read site content"
  on public.site_content
  for select
  using (true);

-- Only signed-in users (the admin account you create in Authentication) can
-- publish changes. This is enforced by Postgres itself, not by the frontend.
create policy "authenticated users can update site content"
  on public.site_content
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
