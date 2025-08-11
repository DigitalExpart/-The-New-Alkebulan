-- Simple script to add missing profile columns
-- Run this to fix the "core_competencies column not found" error

-- 1. Check current columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Add missing columns one by one
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language_preference VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS place_of_birth VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relationship_status VARCHAR(30);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS core_competencies TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_members JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_experience JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Set default values for JSONB columns
UPDATE public.profiles SET family_members = '[]'::jsonb WHERE family_members IS NULL;
UPDATE public.profiles SET work_experience = '[]'::jsonb WHERE work_experience IS NULL;
UPDATE public.profiles SET education = '[]'::jsonb WHERE education IS NULL;

-- 4. Verify all columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
