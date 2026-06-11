-- ════════════════════════════════════════════════════════════════
-- NYC Marathon app — database setup
-- Paste this whole block into the Supabase SQL Editor and click RUN.
-- It creates one table to hold your training data, locked down so
-- only the signed-in owner can read or write their own row.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.training_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Turn on Row Level Security (RLS): no access at all until a policy allows it.
alter table public.training_state enable row level security;

-- Allow each user to read their own row.
create policy "read own training state"
  on public.training_state for select
  using (auth.uid() = user_id);

-- Allow each user to insert their own row.
create policy "insert own training state"
  on public.training_state for insert
  with check (auth.uid() = user_id);

-- Allow each user to update their own row.
create policy "update own training state"
  on public.training_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
