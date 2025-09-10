-- Simple Admin Access Fix for Diaspora Market Hub
-- This script only adds the is_admin column and sets up admin access

-- Step 1: Add is_admin column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_admin' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_admin column to profiles table';
    ELSE
        RAISE NOTICE 'is_admin column already exists';
    END IF;
END $$;

-- Step 2: Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Step 3: Show current profile structure
SELECT 'Current profile columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY column_name;

-- Step 4: Show all users to help identify which one to make admin
SELECT 'All users in the system:' as info;
SELECT 
    id,
    user_id,
    email,
    COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') as full_name,
    CASE 
        WHEN is_admin IS NOT NULL THEN is_admin::text 
        ELSE 'column not exists' 
    END as is_admin_status,
    account_type,
    created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Simple command to make a user admin (without role column)
SELECT 'To make a user admin, run this command:' as instructions;
SELECT 'UPDATE public.profiles SET is_admin = true, updated_at = NOW() WHERE email = ''your-email@example.com'';' as command;
