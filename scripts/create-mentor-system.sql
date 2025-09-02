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