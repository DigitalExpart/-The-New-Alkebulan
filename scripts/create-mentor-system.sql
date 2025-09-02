-- Add price for sessions (idempotent)
ALTER TABLE public.mentor_sessions
  ADD COLUMN IF NOT EXISTS price numeric(10,2) NOT NULL DEFAULT 0;

-- Add columns for expanded mentor profile information
-- Safe to run multiple times; uses IF NOT EXISTS guards

alter table if exists public.mentor_profiles
  add column if not exists years_experience integer,
  add column if not exists work_experience text,
  add column if not exists education_experience text,
  add column if not exists work_experience_json jsonb,
  add column if not exists education_experience_json jsonb;

-- Optional indexes to help filtering/searching by years of experience
create index if not exists mentor_profiles_years_exp_idx on public.mentor_profiles (years_experience);

-- Program-based booking (pay once for the whole program)
create table if not exists public.mentor_programs (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid references auth.users(id) on delete cascade,
  title text,
  description text,
  price_total numeric(10,2) not null default 0,
  capacity integer not null default 1,
  start_date timestamptz,
  end_date timestamptz,
  weeks integer,
  days_per_week integer,
  created_at timestamptz default now()
);

alter table if exists public.mentor_sessions
  add column if not exists program_id uuid references public.mentor_programs(id) on delete cascade;

alter table if exists public.mentor_bookings
  add column if not exists program_id uuid references public.mentor_programs(id) on delete set null;