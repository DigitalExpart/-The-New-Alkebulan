-- Debug script to check current profile roles
-- Run this in your Supabase SQL editor to see what's happening

-- 1. Check if the role columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('buyer_enabled', 'seller_enabled', 'id', 'user_id', 'account_type');

-- 2. Check current profile data for your user
-- Replace 'YOUR_USER_ID' with your actual user ID from the navbar debug info
SELECT 
    id,
    user_id,
    email,
    account_type,
    buyer_enabled,
    seller_enabled,
    created_at,
    updated_at,
    CASE 
        WHEN buyer_enabled = true AND seller_enabled = true THEN 'Both Roles'
        WHEN buyer_enabled = true THEN 'Buyer Only'
        WHEN seller_enabled = true THEN 'Seller Only'
        WHEN buyer_enabled IS NULL OR seller_enabled IS NULL THEN 'Missing Role Data'
        ELSE 'No Roles'
    END as current_status
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check if there are any profiles with NULL role values
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN buyer_enabled IS NULL THEN 1 END) as null_buyer,
    COUNT(CASE WHEN seller_enabled IS NULL THEN 1 END) as null_seller,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_enabled_count,
    COUNT(CASE WHEN seller_enabled = true THEN 1 END) as seller_enabled_count,
    COUNT(CASE WHEN buyer_enabled IS NULL OR seller_enabled IS NULL THEN 1 END) as incomplete_profiles
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
