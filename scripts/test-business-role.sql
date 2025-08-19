-- Test Business Role Update
-- This will verify that the business role can be properly activated

-- Step 1: Check current business role status
SELECT 
    'Current Business Role Status:' as info
UNION ALL
SELECT 'User ID: ' || user_id
UNION ALL
SELECT 'Business Enabled: ' || business_enabled
UNION ALL
SELECT 'Account Type: ' || account_type
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 2: Activate business role
UPDATE public.profiles SET
    business_enabled = true,
    updated_at = NOW()
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 3: Verify the update was successful
SELECT 
    'After Business Role Activation:' as info
UNION ALL
SELECT 'Business Enabled: ' || business_enabled
UNION ALL
SELECT 'Updated At: ' || updated_at
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 4: Test deactivating business role
UPDATE public.profiles SET
    business_enabled = false,
    updated_at = NOW()
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 5: Verify deactivation was successful
SELECT 
    'After Business Role Deactivation:' as info
UNION ALL
SELECT 'Business Enabled: ' || business_enabled
UNION ALL
SELECT 'Updated At: ' || updated_at
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';
