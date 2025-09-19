-- Fix Malformed Array Literals in Profiles Table
-- Run this script in your Supabase SQL Editor

-- 1. Check current array columns in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND data_type LIKE '%[]'
AND table_schema = 'public'
ORDER BY column_name;

-- 2. Fix any existing malformed array literals
-- Update empty strings to proper empty arrays for TEXT[] columns

-- Fix interests column - only update NULL values, skip malformed ones
UPDATE public.profiles 
SET interests = ARRAY[]::TEXT[] 
WHERE interests IS NULL;

-- Fix core_competencies column - only update NULL values
UPDATE public.profiles 
SET core_competencies = ARRAY[]::TEXT[] 
WHERE core_competencies IS NULL;

-- Fix skills column - only update NULL values
UPDATE public.profiles 
SET skills = ARRAY[]::TEXT[] 
WHERE skills IS NULL;

-- Fix languages column - only update NULL values
UPDATE public.profiles 
SET languages = ARRAY[]::TEXT[] 
WHERE languages IS NULL;

-- Fix education column (if it's TEXT[]) - only update NULL values
UPDATE public.profiles 
SET education = ARRAY[]::TEXT[] 
WHERE education IS NULL;

-- Fix selected_roles column - only update NULL values
UPDATE public.profiles 
SET selected_roles = ARRAY['buyer']::TEXT[] 
WHERE selected_roles IS NULL;

-- Fix goals column - only update NULL values
UPDATE public.profiles 
SET goals = ARRAY[]::TEXT[] 
WHERE goals IS NULL;

-- Fix achievements column - only update NULL values
UPDATE public.profiles 
SET achievements = ARRAY[]::TEXT[] 
WHERE achievements IS NULL;

-- Fix challenges column - only update NULL values
UPDATE public.profiles 
SET challenges = ARRAY[]::TEXT[] 
WHERE challenges IS NULL;

-- Fix community_interests column - only update NULL values
UPDATE public.profiles 
SET community_interests = ARRAY[]::TEXT[] 
WHERE community_interests IS NULL;

-- Fix certifications column - only update NULL values
UPDATE public.profiles 
SET certifications = ARRAY[]::TEXT[] 
WHERE certifications IS NULL;

-- 3. Verify the fixes
SELECT 
    user_id,
    first_name,
    last_name,
    interests,
    core_competencies,
    skills,
    languages,
    selected_roles
FROM public.profiles 
LIMIT 5;

-- 4. Test inserting a new profile to ensure it works
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get a test user ID
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing profile insert with user ID: %', test_user_id;
        
        -- Try to insert a test profile with proper array literals
        INSERT INTO public.profiles (
            user_id,
            email,
            first_name,
            last_name,
            username,
            bio,
            location,
            website,
            phone,
            occupation,
            education,
            avatar_url,
            is_public,
            cover_photo_url,
            interests,
            core_competencies,
            skills,
            languages,
            selected_roles,
            goals,
            achievements,
            challenges,
            community_interests,
            certifications
        ) VALUES (
            test_user_id,
            'test@example.com',
            'Test',
            'User',
            'testuser',
            '',
            '',
            '',
            '',
            '',
            ARRAY[]::TEXT[],
            NULL,
            true,
            NULL,
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            ARRAY['buyer']::TEXT[],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[]
        );
        
        RAISE NOTICE 'Test profile insert successful!';
        
        -- Clean up test data
        DELETE FROM public.profiles WHERE user_id = test_user_id;
        RAISE NOTICE 'Test data cleaned up.';
        
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$;
