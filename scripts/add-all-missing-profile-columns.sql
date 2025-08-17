-- Add all missing profile columns
-- This script fixes all missing columns that are referenced in the profile edit page

-- 1. Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add username column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT;
        RAISE NOTICE 'Added username column';
    END IF;
    
    -- Add region column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'region') THEN
        ALTER TABLE public.profiles ADD COLUMN region TEXT;
        RAISE NOTICE 'Added region column';
    END IF;
    
    -- Add gender column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE public.profiles ADD COLUMN gender TEXT;
        RAISE NOTICE 'Added gender column';
    END IF;
    
    -- Add place_of_birth column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'place_of_birth') THEN
        ALTER TABLE public.profiles ADD COLUMN place_of_birth TEXT;
        RAISE NOTICE 'Added place_of_birth column';
    END IF;
    
    -- Add date_of_birth column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'date_of_birth') THEN
        ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE;
        RAISE NOTICE 'Added date_of_birth column';
    END IF;
    
    -- Add relationship_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'relationship_status') THEN
        ALTER TABLE public.profiles ADD COLUMN relationship_status TEXT;
        RAISE NOTICE 'Added relationship_status column';
    END IF;
    
    -- Add family_members column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'family_members') THEN
        ALTER TABLE public.profiles ADD COLUMN family_members JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added family_members column';
    END IF;
    
    -- Add work_experience column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'work_experience') THEN
        ALTER TABLE public.profiles ADD COLUMN work_experience JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added work_experience column';
    END IF;
    
    -- Add language_preference column (if not already added)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'language_preference') THEN
        ALTER TABLE public.profiles ADD COLUMN language_preference TEXT[] DEFAULT ARRAY['English'];
        RAISE NOTICE 'Added language_preference column';
    END IF;
    
    -- Add avatar_url column (if not already added)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column';
    END IF;
    
    RAISE NOTICE 'All missing columns have been added successfully!';
END $$;

-- 2. Update existing profiles to have default values for new columns
UPDATE public.profiles 
SET 
    family_members = '[]'::jsonb,
    work_experience = '[]'::jsonb
WHERE family_members IS NULL OR work_experience IS NULL;

-- 3. Show current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Show sample profiles
SELECT 
    id,
    full_name,
    username,
    region,
    gender,
    language_preference,
    created_at
FROM public.profiles 
LIMIT 5;

-- 5. Success message
SELECT 'All missing profile columns have been added successfully! Profile editing should now work.' as result;

