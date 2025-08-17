-- Create Profile for Current User
-- This script creates a profile record for the current authenticated user

-- First, let's see what users exist in auth.users
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- Check which users don't have profiles
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name' as full_name,
    CASE WHEN p.id IS NULL THEN 'MISSING PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC;

-- Create missing profiles for existing users
INSERT INTO public.profiles (
    user_id,
    full_name,
    email,
    bio,
    location,
    website,
    phone,
    occupation,
    education,
    core_competencies,
    interests,
    account_type,
    buyer_enabled,
    business_enabled,
    is_public,
    created_at,
    updated_at
)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
    au.email,
    '' as bio,
    '' as location,
    '' as website,
    '' as phone,
    '' as occupation,
    '' as education,
    ARRAY[]::TEXT[] as core_competencies,
    ARRAY[]::TEXT[] as interests,
    'buyer' as account_type,
    true as buyer_enabled,
    false as business_enabled,
    true as is_public,
    au.created_at,
    COALESCE(au.updated_at, au.created_at)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Verify the results
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as users_with_profiles,
    COUNT(CASE WHEN p.id IS NULL THEN 1 END) as users_without_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id;

-- Show final profile status
SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.email,
    p.account_type,
    p.buyer_enabled,
    p.business_enabled,
    p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC;

-- Success message
SELECT 'Profile creation completed! Check the results above.' as result;
