-- Diagnose Profile Creation Issues
-- Run this script in your Supabase SQL Editor to identify problems

-- 1. Check if profiles table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check for any constraints on the profiles table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- 3. Check if there are any existing profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 4. Check for any RLS policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Check if the current user can insert into profiles
-- This will show if RLS is blocking the insert
SELECT 
    has_table_privilege(auth.uid(), 'public.profiles', 'INSERT') as can_insert,
    has_table_privilege(auth.uid(), 'public.profiles', 'SELECT') as can_select,
    has_table_privilege(auth.uid(), 'public.profiles', 'UPDATE') as can_update;

-- 6. Check if there are any triggers on profiles table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 7. Test a simple insert to see what error occurs
-- Replace 'test-user-id' with an actual user ID from auth.users
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get a test user ID
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing insert with user ID: %', test_user_id;
        
        -- Try to insert a test profile
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
            cover_photo_url
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
            '',
            NULL,
            true,
            NULL
        );
        
        RAISE NOTICE 'Test insert successful!';
        
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
