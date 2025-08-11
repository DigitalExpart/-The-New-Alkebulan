-- Check the current status of profiles and role columns
-- Run this to diagnose the role switching issue

-- 1. Check if the role columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('buyer_enabled', 'seller_enabled', 'id', 'user_id');

-- 2. Check current profile data
SELECT 
    id,
    buyer_enabled,
    seller_enabled,
    account_type,
    created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if there are any profiles with NULL role values
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN buyer_enabled IS NULL THEN 1 END) as null_buyer,
    COUNT(CASE WHEN seller_enabled IS NULL THEN 1 END) as null_seller,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_enabled_count,
    COUNT(CASE WHEN seller_enabled = true THEN 1 END) as seller_enabled_count
FROM public.profiles;

-- 4. Show the structure of the profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
