-- Add JSONB columns to profiles for family members and work experience
alter table public.profiles
  add column if not exists family_members jsonb,
  add column if not exists work_experience jsonb;


