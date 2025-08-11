-- Add comprehensive profile fields for the edit profile page
-- This script adds all the missing columns that the profile edit form needs

-- 1. First, check what columns currently exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Add username column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- 3. Add language preference
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(20) DEFAULT 'English';

-- 4. Add region
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS region VARCHAR(100);

-- 5. Add gender
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- 6. Add place of birth
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS place_of_birth VARCHAR(100);

-- 7. Add date of birth
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 8. Add relationship status
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS relationship_status VARCHAR(30);

-- 9. Add interests as text array
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS interests TEXT[];

-- 10. Add core competencies as text array
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS core_competencies TEXT[];

-- 11. Add family members as JSONB
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS family_members JSONB DEFAULT '[]'::jsonb;

-- 12. Add work experience as JSONB
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]'::jsonb;

-- 13. Add education as JSONB
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;

-- 14. Add avatar_url if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 15. Verify all columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 16. Show sample profile data
SELECT 
    id,
    email,
    full_name,
    username,
    language_preference,
    region,
    gender,
    place_of_birth,
    date_of_birth,
    relationship_status,
    interests,
    core_competencies,
    family_members,
    work_experience,
    education,
    avatar_url,
    buyer_enabled,
    seller_enabled
FROM public.profiles 
LIMIT 3;
