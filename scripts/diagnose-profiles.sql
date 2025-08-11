-- Diagnose the current profiles table state
-- Run this first to see what we're working with

-- 1. Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Check existing profiles - see what data we have
SELECT 
    id,
    user_id,
    email,
    full_name,
    account_type,
    buyer_enabled,
    seller_enabled,
    created_at,
    updated_at
FROM public.profiles 
ORDER BY created_at DESC;

-- 3. Check which profiles are missing role information
SELECT 
    id,
    user_id,
    email,
    account_type,
    buyer_enabled,
    seller_enabled,
    CASE 
        WHEN buyer_enabled IS NULL THEN 'MISSING buyer_enabled'
        WHEN seller_enabled IS NULL THEN 'MISSING seller_enabled'
        ELSE 'COMPLETE'
    END as missing_info
FROM public.profiles 
WHERE buyer_enabled IS NULL OR seller_enabled IS NULL
ORDER BY created_at DESC;

-- 4. Check auth.users to see what account types exist
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    raw_user_meta_data->>'account_type' as account_type,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 5. Count profiles by status
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN buyer_enabled IS NOT NULL AND seller_enabled IS NOT NULL THEN 1 END) as complete_profiles,
    COUNT(CASE WHEN buyer_enabled IS NULL OR seller_enabled IS NULL THEN 1 END) as incomplete_profiles
FROM public.profiles;
