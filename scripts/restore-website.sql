-- Restore Website Functionality
-- This will fix the buyer/business mode and profile icon issues

-- Step 1: Check current profile state
SELECT 
    'Current Profile State:' as info
UNION ALL
SELECT 'Profile ID: ' || id
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
WHERE id = 'bd55f9a6-ea51-4c3a-aa72-00a1697e79d2';

-- Step 2: Restore the profile with all required fields
UPDATE public.profiles SET
    business_enabled = true,
    buyer_enabled = true,
    account_type = 'buyer',
    updated_at = NOW()
WHERE id = 'bd55f9a6-ea51-4c3a-aa72-00a1697e79d2';

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
WHERE id = 'bd55f9a6-ea51-4c3a-aa72-00a1697e79d2';

-- Step 4: Check if user exists in auth.users
SELECT 
    'Auth Check:' as info
UNION ALL
SELECT 'User exists: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = 'ro.osemwengie@gmail.com'
    ) THEN 'YES' ELSE 'NO' END;
