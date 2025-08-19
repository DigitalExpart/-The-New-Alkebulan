-- Test Role Management Functionality
-- This will check if the role management system is working

-- Step 1: Check current profile state
SELECT 
    'Current Profile State:' as info
UNION ALL
SELECT 'User ID: ' || user_id
UNION ALL
SELECT 'First Name: ' || COALESCE(first_name, 'NULL')
UNION ALL
SELECT 'Last Name: ' || COALESCE(last_name, 'NULL')
UNION ALL
SELECT 'Business Enabled: ' || business_enabled
UNION ALL
SELECT 'Buyer Enabled: ' || buyer_enabled
UNION ALL
SELECT 'Creator Enabled: ' || COALESCE(creator_enabled, 'NULL')
UNION ALL
SELECT 'Investor Enabled: ' || COALESCE(investor_enabled, 'NULL')
UNION ALL
SELECT 'Mentor Enabled: ' || COALESCE(mentor_enabled, 'NULL')
UNION ALL
SELECT 'Account Type: ' || COALESCE(account_type, 'NULL')
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 2: Test updating a role
UPDATE public.profiles SET
    creator_enabled = true,
    investor_enabled = true,
    mentor_enabled = true,
    updated_at = NOW()
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 3: Verify the update
SELECT 
    'Roles Updated:' as info
UNION ALL
SELECT 'Creator Enabled: ' || creator_enabled
UNION ALL
SELECT 'Investor Enabled: ' || investor_enabled
UNION ALL
SELECT 'Mentor Enabled: ' || mentor_enabled
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';
