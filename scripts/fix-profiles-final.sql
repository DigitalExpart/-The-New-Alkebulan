-- Final fix for profiles table - handles existing profiles and missing columns
-- This script will check existing profiles and only add missing data

-- STEP 1: Check the current profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- STEP 2: Check which users exist in auth.users
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    raw_user_meta_data->>'account_type' as account_type,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- STEP 3: Check which users don't have profiles
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.raw_user_meta_data->>'account_type' as account_type,
    CASE WHEN p.id IS NULL THEN 'MISSING PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- STEP 4: Check existing profiles for missing buyer_enabled/seller_enabled columns
SELECT 
    p.id,
    p.user_id,
    p.email,
    p.full_name,
    p.account_type,
    p.buyer_enabled,
    p.seller_enabled,
    CASE 
        WHEN p.buyer_enabled IS NULL OR p.seller_enabled IS NULL THEN 'NEEDS UPDATE'
        ELSE 'COMPLETE'
    END as status
FROM public.profiles p
ORDER BY p.created_at DESC;

-- STEP 5: Update existing profiles that are missing buyer_enabled/seller_enabled
UPDATE public.profiles 
SET 
    buyer_enabled = CASE 
        WHEN account_type = 'seller' THEN false 
        ELSE true 
    END,
    seller_enabled = CASE 
        WHEN account_type = 'seller' THEN true 
        ELSE false 
    END,
    updated_at = NOW()
WHERE buyer_enabled IS NULL OR seller_enabled IS NULL;

-- STEP 6: Create missing profiles ONLY for users who don't have any profile
INSERT INTO public.profiles (
    id,
    user_id,
    email,
    full_name,
    account_type,
    buyer_enabled,
    seller_enabled,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.id, -- user_id should be the same as id
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
    COALESCE(au.raw_user_meta_data->>'account_type', 'buyer') as account_type,
    CASE WHEN au.raw_user_meta_data->>'account_type' = 'seller' THEN false ELSE true END as buyer_enabled,
    CASE WHEN au.raw_user_meta_data->>'account_type' = 'seller' THEN true ELSE false END as seller_enabled,
    au.created_at,
    COALESCE(au.updated_at, au.created_at)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- STEP 7: Verify the final results
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as users_with_profiles,
    COUNT(CASE WHEN p.id IS NULL THEN 1 END) as users_without_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- STEP 8: Show final profile status with all important fields
SELECT 
    p.id,
    p.user_id,
    p.email,
    p.full_name,
    p.account_type,
    p.buyer_enabled,
    p.seller_enabled,
    p.created_at,
    CASE 
        WHEN p.buyer_enabled AND p.seller_enabled THEN 'Both'
        WHEN p.buyer_enabled THEN 'Buyer'
        WHEN p.seller_enabled THEN 'Seller'
        ELSE 'No Role'
    END as current_role
FROM public.profiles p
ORDER BY p.created_at DESC;
