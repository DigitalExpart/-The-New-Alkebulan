-- Setup Default Role System
-- This will ensure all users have buyer role enabled by default
-- Business role will be optional and can be activated/deactivated

-- Step 1: Add missing role columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS creator_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS investor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mentor_enabled BOOLEAN DEFAULT false;

-- Step 2: Set buyer role as mandatory (enabled by default) for all users
UPDATE public.profiles SET
    buyer_enabled = true,
    account_type = 'buyer',
    updated_at = NOW()
WHERE buyer_enabled IS NULL 
   OR buyer_enabled = false;

-- Step 3: Ensure business role is optional (can be true or false)
-- Don't force it to true - let users choose in role management
UPDATE public.profiles SET
    business_enabled = COALESCE(business_enabled, false),
    creator_enabled = COALESCE(creator_enabled, false),
    investor_enabled = COALESCE(investor_enabled, false),
    mentor_enabled = COALESCE(mentor_enabled, false),
    updated_at = NOW()
WHERE business_enabled IS NULL 
   OR creator_enabled IS NULL 
   OR investor_enabled IS NULL 
   OR mentor_enabled IS NULL;

-- Step 4: Verify the setup
SELECT 
    'Default Role System Setup:' as info
UNION ALL
SELECT 'Total profiles updated: ' || COUNT(*)::text
FROM public.profiles;

-- Step 5: Show your profile status
SELECT 
    'Your Profile Status:' as info
UNION ALL
SELECT 'User ID: ' || user_id
UNION ALL
SELECT 'Buyer Enabled: ' || buyer_enabled || ' (Default - Always ON)'
UNION ALL
SELECT 'Business Enabled: ' || business_enabled || ' (Optional - Can toggle)'
UNION ALL
SELECT 'Creator Enabled: ' || creator_enabled || ' (Optional - Can toggle)'
UNION ALL
SELECT 'Investor Enabled: ' || investor_enabled || ' (Optional - Can toggle)'
UNION ALL
SELECT 'Mentor Enabled: ' || mentor_enabled || ' (Optional - Can toggle)'
UNION ALL
SELECT 'Account Type: ' || account_type
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';
