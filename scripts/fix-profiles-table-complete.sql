-- Complete fix for profiles table - Run this to fix all issues

-- 1. First, let's see what we currently have
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Add all missing columns that might be required
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Remove problematic defaults that override user choices
ALTER TABLE public.profiles ALTER COLUMN buyer_enabled SET DEFAULT NULL;
ALTER TABLE public.profiles ALTER COLUMN seller_enabled SET DEFAULT NULL;

-- 4. Check for any constraint issues
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles';

-- 5. Show the final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check if there are any existing profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 7. Show sample profile data
SELECT id, full_name, email, account_type, buyer_enabled, seller_enabled, created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 5;
