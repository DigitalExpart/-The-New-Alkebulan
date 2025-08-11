-- Update existing profiles only - no new profile creation
-- This script will only update existing profiles to fix missing columns

-- 1. Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Check existing profiles and their current status
SELECT 
    id, 
    user_id, 
    email, 
    account_type, 
    buyer_enabled, 
    seller_enabled,
    CASE 
        WHEN buyer_enabled IS NULL OR seller_enabled IS NULL THEN 'NEEDS UPDATE'
        ELSE 'COMPLETE'
    END as status
FROM public.profiles 
ORDER BY created_at DESC;

-- 3. Update existing profiles to set buyer_enabled and seller_enabled
-- This only updates profiles that are missing these columns
UPDATE public.profiles 
SET 
    buyer_enabled = CASE 
        WHEN account_type = 'seller' THEN false 
        ELSE true 
    END,
    seller_enabled = CASE 
        WHEN account_type = 'seller' THEN true 
        ELSE false 
    END,
    updated_at = NOW()
WHERE buyer_enabled IS NULL OR seller_enabled IS NULL;

-- 4. Verify the update worked
SELECT 
    id, 
    user_id, 
    email, 
    account_type, 
    buyer_enabled, 
    seller_enabled,
    CASE 
        WHEN buyer_enabled IS NULL OR seller_enabled IS NULL THEN 'NEEDS UPDATE'
        ELSE 'COMPLETE'
    END as status
FROM public.profiles 
ORDER BY created_at DESC;

-- 5. Show final role summary
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_enabled_count,
    COUNT(CASE WHEN seller_enabled = true THEN 1 END) as seller_enabled_count,
    COUNT(CASE WHEN buyer_enabled IS NULL OR seller_enabled IS NULL THEN 1 END) as incomplete_count
FROM public.profiles;
