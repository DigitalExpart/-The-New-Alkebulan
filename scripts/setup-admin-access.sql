-- Setup Admin Access for Diaspora Market Hub
-- This script adds the is_admin column and sets up admin access

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

-- Step 3: Add role column if it doesn't exist (for compatibility with different schemas)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'member';
        RAISE NOTICE 'Added role column to profiles table';
    ELSE
        RAISE NOTICE 'role column already exists';
    END IF;
END $$;

-- Step 4: Show current profile structure
SELECT 'Current profile columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('is_admin', 'role', 'selected_roles', 'account_type', 'email', 'user_id')
ORDER BY column_name;

-- Step 5: Show all users to help identify which one to make admin
SELECT 'All users in the system:' as info;
SELECT 
    id,
    user_id,
    email,
    COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') as full_name,
    is_admin,
    role,
    account_type,
    created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 10;

-- Step 6: Instructions for making a user admin
SELECT 'To make a user admin, run one of these commands:' as instructions;
SELECT '-- Option 1: Update by email' as example;
SELECT 'UPDATE public.profiles SET is_admin = true, role = ''admin'', updated_at = NOW() WHERE email = ''your-email@example.com'';' as command;
SELECT '-- Option 2: Update by user_id' as example2;
SELECT 'UPDATE public.profiles SET is_admin = true, role = ''admin'', updated_at = NOW() WHERE user_id = ''your-user-id-here'';' as command2;
