-- Fix existing seller accounts - Clean version
-- This script will update existing profiles to have proper seller settings

-- 1. First, let's see what we currently have
SELECT id, buyer_enabled, seller_enabled, account_type, full_name, email 
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Update profiles to have proper account_type based on current settings
UPDATE public.profiles 
SET account_type = CASE 
    WHEN seller_enabled = TRUE THEN 'seller'
    WHEN buyer_enabled = TRUE THEN 'buyer'
    ELSE 'buyer'
END
WHERE account_type IS NULL OR account_type = '';

-- 3. Fix any profiles that might have both buyer and seller enabled
UPDATE public.profiles 
SET buyer_enabled = FALSE, seller_enabled = TRUE, account_type = 'seller'
WHERE buyer_enabled = TRUE AND seller_enabled = TRUE;

-- 4. Ensure seller accounts have correct settings
UPDATE public.profiles 
SET seller_enabled = TRUE, buyer_enabled = FALSE
WHERE account_type = 'seller' AND (seller_enabled = FALSE OR buyer_enabled = TRUE);

-- 5. Ensure buyer accounts have correct settings  
UPDATE public.profiles 
SET buyer_enabled = TRUE, seller_enabled = FALSE
WHERE account_type = 'buyer' AND (buyer_enabled = FALSE OR seller_enabled = TRUE);

-- 6. Set user_id to match id if user_id is NULL
UPDATE public.profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- 7. Verify the changes
SELECT id, account_type, buyer_enabled, seller_enabled, full_name, email, created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 20;

-- 8. Show summary of account types
SELECT 
    account_type,
    COUNT(*) as count,
    COUNT(CASE WHEN buyer_enabled = TRUE THEN 1 END) as buyer_count,
    COUNT(CASE WHEN seller_enabled = TRUE THEN 1 END) as seller_count
FROM public.profiles 
GROUP BY account_type;
