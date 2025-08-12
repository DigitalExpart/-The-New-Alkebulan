-- Fix profiles table structure and update existing data
-- This script will fix the missing columns and update seller accounts

-- 1. Add missing columns for account management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'buyer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Update existing profiles to have proper account_type based on current settings
-- First, let's see what we have
SELECT id, buyer_enabled, seller_enabled, account_type, full_name, email 
FROM public.profiles 
LIMIT 10;

-- 3. Update profiles to have proper account_type
UPDATE public.profiles 
SET account_type = CASE 
    WHEN seller_enabled = TRUE THEN 'seller'
    WHEN buyer_enabled = TRUE THEN 'buyer'
    ELSE 'buyer'
END,
updated_at = NOW()
WHERE account_type IS NULL OR account_type = '';

-- 4. Fix any profiles that might have both buyer and seller enabled (shouldn't happen)
UPDATE public.profiles 
SET buyer_enabled = FALSE, seller_enabled = TRUE, account_type = 'seller'
WHERE buyer_enabled = TRUE AND seller_enabled = TRUE;

-- 5. Ensure seller accounts have correct settings
UPDATE public.profiles 
SET seller_enabled = TRUE, buyer_enabled = FALSE
WHERE account_type = 'seller' AND (seller_enabled = FALSE OR buyer_enabled = TRUE);

-- 6. Ensure buyer accounts have correct settings
UPDATE public.profiles 
SET buyer_enabled = TRUE, seller_enabled = FALSE
WHERE account_type = 'buyer' AND (buyer_enabled = FALSE OR seller_enabled = TRUE);

-- 7. Set user_id to match id if user_id is NULL
UPDATE public.profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- 8. Verify the changes
SELECT id, account_type, buyer_enabled, seller_enabled, full_name, email, created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 20;

-- 9. Show summary of account types
SELECT 
    account_type,
    COUNT(*) as count,
    COUNT(CASE WHEN buyer_enabled = TRUE THEN 1 END) as buyer_count,
    COUNT(CASE WHEN seller_enabled = TRUE THEN 1 END) as seller_count
FROM public.profiles 
GROUP BY account_type; 