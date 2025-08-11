-- Simple fix for profiles table - step by step
-- Run each section separately to avoid errors

-- 1. Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Check existing profiles
SELECT id, user_id, email, account_type, buyer_enabled, seller_enabled 
FROM public.profiles 
ORDER BY created_at DESC;

-- 3. Update existing profiles to set buyer_enabled and seller_enabled
UPDATE public.profiles 
SET 
    buyer_enabled = CASE WHEN account_type = 'seller' THEN false ELSE true END,
    seller_enabled = CASE WHEN account_type = 'seller' THEN true ELSE false END
WHERE buyer_enabled IS NULL OR seller_enabled IS NULL;

-- 4. Check which users don't have profiles
SELECT au.id, au.email, au.raw_user_meta_data->>'account_type' as account_type
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 5. Create missing profiles (only for users without profiles)
INSERT INTO public.profiles (
    id, user_id, email, full_name, account_type, buyer_enabled, seller_enabled, created_at, updated_at
)
SELECT 
    au.id,
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email),
    COALESCE(au.raw_user_meta_data->>'account_type', 'buyer'),
    CASE WHEN au.raw_user_meta_data->>'account_type' = 'seller' THEN false ELSE true END,
    CASE WHEN au.raw_user_meta_data->>'account_type' = 'seller' THEN true ELSE false END,
    au.created_at,
    au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 6. Final verification
SELECT 
    p.id,
    p.user_id,
    p.email,
    p.account_type,
    p.buyer_enabled,
    p.seller_enabled,
    CASE 
        WHEN p.buyer_enabled THEN 'Buyer' 
        WHEN p.seller_enabled THEN 'Seller' 
        ELSE 'No Role' 
    END as role
FROM public.profiles p
ORDER BY p.created_at DESC; 