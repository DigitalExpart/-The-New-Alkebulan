-- Fix buyer_enabled to always be true for all users
-- This ensures the buyer role is always available for switching

-- Step 1: Set buyer_enabled to true for all users
UPDATE public.profiles 
SET buyer_enabled = true 
WHERE buyer_enabled = false OR buyer_enabled IS NULL;

-- Step 2: Verify the fix
SELECT 
    'Buyer role fix applied' as message,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_enabled_count,
    COUNT(CASE WHEN business_enabled = true THEN 1 END) as business_enabled_count
FROM public.profiles;

-- Step 3: Show current state for your profile
SELECT 
    'Your current profile state' as section,
    id,
    user_id,
    email,
    account_type,
    buyer_enabled,
    business_enabled,
    creator_enabled,
    investor_enabled,
    mentor_enabled
FROM public.profiles 
WHERE email = 'jumatomosanya@gmail.com';  -- Replace with your email
