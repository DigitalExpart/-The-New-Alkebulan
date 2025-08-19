-- Restore Website - Working Version
-- This will fix buyer/business mode and profile icon

-- Step 1: Check current profile state using user_id
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
SELECT 'Account Type: ' || COALESCE(account_type, 'NULL')
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 2: Restore the profile with all required fields
UPDATE public.profiles SET
    business_enabled = true,
    buyer_enabled = true,
    account_type = 'buyer',
    updated_at = NOW()
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 3: Verify the restore
SELECT 
    'Profile Restored:' as info
UNION ALL
SELECT 'Business Enabled: ' || business_enabled
UNION ALL
SELECT 'Buyer Enabled: ' || buyer_enabled
UNION ALL
SELECT 'Account Type: ' || account_type
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 4: Check if user exists in auth.users
SELECT 
    'Auth Check:' as info
UNION ALL
SELECT 'User exists: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = 'ro.osemwengie@gmail.com'
    ) THEN 'YES' ELSE 'NO' END;
