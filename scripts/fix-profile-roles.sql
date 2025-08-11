-- Fix profile roles by setting default values
-- This script will ensure all profiles have proper role settings

-- 1. First, ensure the columns exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS buyer_enabled BOOLEAN DEFAULT true;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS seller_enabled BOOLEAN DEFAULT false;

-- 2. Set default values for existing profiles that have NULL values
UPDATE public.profiles 
SET buyer_enabled = true 
WHERE buyer_enabled IS NULL;

UPDATE public.profiles 
SET seller_enabled = false 
WHERE seller_enabled IS NULL;

-- 3. If there are profiles with account_type = 'seller', enable seller role
UPDATE public.profiles 
SET seller_enabled = true, buyer_enabled = false
WHERE account_type = 'seller';

-- 4. Ensure at least one role is enabled for each profile
UPDATE public.profiles 
SET buyer_enabled = true 
WHERE buyer_enabled = false AND seller_enabled = false;

-- 5. Verify the changes
SELECT 
    id,
    buyer_enabled,
    seller_enabled,
    account_type,
    CASE 
        WHEN buyer_enabled AND seller_enabled THEN 'Both'
        WHEN buyer_enabled THEN 'Buyer'
        WHEN seller_enabled THEN 'Seller'
        ELSE 'No Role'
    END as current_role
FROM public.profiles 
ORDER BY created_at DESC;

-- 6. Show summary
SELECT 
    COUNT(*) as total_profiles,
    SUM(CASE WHEN buyer_enabled THEN 1 ELSE 0 END) as buyer_enabled_count,
    SUM(CASE WHEN seller_enabled THEN 1 ELSE 0 END) as seller_enabled_count,
    SUM(CASE WHEN buyer_enabled AND seller_enabled THEN 1 ELSE 0 END) as both_roles_count
FROM public.profiles;
