-- Check for Role Interference
-- This will identify any database triggers or functions that might be causing roles to toggle back off

-- Step 1: Check for triggers on the profiles table
SELECT 
    'Triggers on profiles table:' as info
UNION ALL
SELECT trigger_name || ' - ' || event_manipulation || ' - ' || action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
AND trigger_schema = 'public';

-- Step 2: Check for functions that might be called by triggers
SELECT 
    'Functions that might affect profiles:' as info
UNION ALL
SELECT routine_name || ' - ' || routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%profile%'
OR routine_name LIKE '%role%'
OR routine_name LIKE '%user%';

-- Step 3: Check current profile state
SELECT 
    'Current Profile State:' as info
UNION ALL
SELECT 'User ID: ' || user_id
UNION ALL
SELECT 'Business Enabled: ' || business_enabled
UNION ALL
SELECT 'Creator Enabled: ' || creator_enabled
UNION ALL
SELECT 'Investor Enabled: ' || investor_enabled
UNION ALL
SELECT 'Mentor Enabled: ' || mentor_enabled
UNION ALL
SELECT 'Account Type: ' || account_type
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 4: Test business role toggle manually
UPDATE public.profiles SET
    business_enabled = true,
    updated_at = NOW()
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 5: Verify the update
SELECT 
    'After Manual Update:' as info
UNION ALL
SELECT 'Business Enabled: ' || business_enabled
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';
