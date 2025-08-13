-- Fix script for seller role issue
-- Run this in your Supabase SQL editor

-- 1. First, ensure the role columns exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS buyer_enabled BOOLEAN DEFAULT true;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS seller_enabled BOOLEAN DEFAULT false;

-- 2. Update any profiles that have NULL values for roles
UPDATE public.profiles 
SET 
    buyer_enabled = COALESCE(buyer_enabled, true),
    seller_enabled = COALESCE(seller_enabled, false)
WHERE buyer_enabled IS NULL OR seller_enabled IS NULL;

-- 3. If you have a specific user who should be a seller, update them
-- Replace 'YOUR_EMAIL' with your actual email address
UPDATE public.profiles 
SET 
    seller_enabled = true,
    buyer_enabled = false,
    account_type = 'seller',
    updated_at = NOW()
WHERE email = 'YOUR_EMAIL'; -- Replace with your email

-- 4. Verify the changes
SELECT 
    id,
    user_id,
    email,
    account_type,
    buyer_enabled,
    seller_enabled,
    CASE 
        WHEN buyer_enabled = true AND seller_enabled = true THEN 'Both Roles'
        WHEN buyer_enabled = true THEN 'Buyer Only'
        WHEN seller_enabled = true THEN 'Seller Only'
        ELSE 'No Roles'
    END as current_status
FROM public.profiles 
WHERE email = 'YOUR_EMAIL'; -- Replace with your email

-- 5. Show summary of all profiles
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_enabled_count,
    COUNT(CASE WHEN seller_enabled = true THEN 1 END) as seller_enabled_count,
    COUNT(CASE WHEN buyer_enabled IS NULL OR seller_enabled IS NULL THEN 1 END) as incomplete_count
FROM public.profiles;
