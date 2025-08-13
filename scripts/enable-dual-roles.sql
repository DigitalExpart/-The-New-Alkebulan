-- Enable dual-role capability for all users
-- This script will allow every user to access both buyer and seller dashboards

-- 1. First, ensure the role columns exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS buyer_enabled BOOLEAN DEFAULT true;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS seller_enabled BOOLEAN DEFAULT true;

-- 2. Enable both roles for ALL existing profiles
UPDATE public.profiles 
SET 
    buyer_enabled = true,
    seller_enabled = true,
    updated_at = NOW()
WHERE buyer_enabled IS NULL 
   OR seller_enabled IS NULL 
   OR buyer_enabled = false 
   OR seller_enabled = false;

-- 3. Verify the changes
SELECT 
    id,
    user_id,
    email,
    account_type,
    buyer_enabled,
    seller_enabled,
    CASE 
        WHEN buyer_enabled = true AND seller_enabled = true THEN '✅ Dual Role (Buyer + Seller)'
        WHEN buyer_enabled = true THEN '✅ Buyer Only'
        WHEN seller_enabled = true THEN '✅ Seller Only'
        ELSE '❌ No Roles'
    END as current_status
FROM public.profiles 
ORDER BY created_at DESC;

-- 4. Show summary
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_enabled_count,
    COUNT(CASE WHEN seller_enabled = true THEN 1 END) as seller_enabled_count,
    COUNT(CASE WHEN buyer_enabled = true AND seller_enabled = true THEN 1 END) as dual_role_count,
    COUNT(CASE WHEN buyer_enabled IS NULL OR seller_enabled IS NULL THEN 1 END) as incomplete_count
FROM public.profiles;

-- 5. Update any profiles that still have NULL values
UPDATE public.profiles 
SET 
    buyer_enabled = COALESCE(buyer_enabled, true),
    seller_enabled = COALESCE(seller_enabled, true),
    updated_at = NOW()
WHERE buyer_enabled IS NULL OR seller_enabled IS NULL;
