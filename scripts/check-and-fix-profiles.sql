-- Check and fix profile issues - simplified version
-- Run this script step by step to diagnose and fix the profile problems

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

-- STEP 4: Create missing profiles (only if they don't exist)
INSERT INTO public.profiles (
    id,
    full_name,
    email,
    account_type,
    buyer_enabled,
    seller_enabled,
    created_at,
    updated_at
)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
    au.email,
    COALESCE(au.raw_user_meta_data->>'account_type', 'buyer') as account_type,
    CASE WHEN au.raw_user_meta_data->>'account_type' = 'seller' THEN false ELSE true END as buyer_enabled,
    CASE WHEN au.raw_user_meta_data->>'account_type' = 'seller' THEN true ELSE false END as seller_enabled,
    au.created_at,
    COALESCE(au.updated_at, au.created_at)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- STEP 5: Verify the results
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as users_with_profiles,
    COUNT(CASE WHEN p.id IS NULL THEN 1 END) as users_without_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- STEP 6: Show final profile status
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.account_type,
    p.buyer_enabled,
    p.seller_enabled,
    p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC;
