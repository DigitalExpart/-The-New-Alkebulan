-- Test User Signup Functionality
-- This script tests if the user signup process works correctly

-- ============================================================================
-- STEP 1: CHECK CURRENT SETUP
-- ============================================================================

-- Check if profiles table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') 
        THEN '✅ Profiles table exists' 
        ELSE '❌ Profiles table does not exist' 
    END as profiles_table_status;

-- Check if the trigger function exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM pg_proc WHERE proname = 'handle_new_user') 
        THEN '✅ handle_new_user function exists' 
        ELSE '❌ handle_new_user function does not exist' 
    END as trigger_function_status;

-- Check if the trigger exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM pg_trigger WHERE tgname = 'on_auth_user_created') 
        THEN '✅ on_auth_user_created trigger exists' 
        ELSE '❌ on_auth_user_created trigger does not exist' 
    END as trigger_status;

-- Check RLS policies
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- STEP 2: MANUAL TEST (COMMENTED OUT - FOR REFERENCE ONLY)
-- ============================================================================

-- This section shows how to manually test the signup process
-- Uncomment and run these lines to test manually (replace with actual user ID)

/*
-- Test 1: Check if we can insert a profile manually
INSERT INTO public.profiles (user_id, full_name, avatar_url)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
    'Test User',
    'https://example.com/avatar.jpg'
);

-- Test 2: Check if the profile was created
SELECT * FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Test 3: Clean up test data
DELETE FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-000000000000';
*/

-- ============================================================================
-- STEP 3: VERIFY CONSTRAINTS
-- ============================================================================

-- Check foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'profiles';

-- Check unique constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE' 
    AND tc.table_name = 'profiles';

-- ============================================================================
-- STEP 4: CHECK FOR COMMON ISSUES
-- ============================================================================

-- Check if there are any existing profiles with issues
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_ids,
    COUNT(CASE WHEN full_name IS NULL THEN 1 END) as null_names
FROM public.profiles;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- ============================================================================
-- STEP 5: SUMMARY
-- ============================================================================

SELECT 
    'User signup test completed. Check the results above.' as summary,
    'If all checks show ✅, user signup should work correctly.' as note,
    'If any checks show ❌, run the fix-user-signup-error.sql script.' as action; 