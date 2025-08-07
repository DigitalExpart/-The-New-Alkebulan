-- Fix profiles table user_id column issue
-- This script handles existing null values before setting NOT NULL constraint

-- Step 1: First, let's see what we're working with
SELECT 
    id,
    email,
    full_name,
    user_id,
    created_at
FROM public.profiles 
WHERE user_id IS NULL;

-- Step 2: For records with null user_id, we need to either:
-- Option A: Delete them if they're orphaned
-- Option B: Try to match them with auth.users based on email

-- Let's try to match by email first
UPDATE public.profiles 
SET user_id = auth_users.id
FROM auth.users auth_users
WHERE profiles.user_id IS NULL 
AND profiles.email = auth_users.email;

-- Step 3: Check if there are still null user_id records
SELECT COUNT(*) as remaining_null_records 
FROM public.profiles 
WHERE user_id IS NULL;

-- Step 4: If there are still null records, we'll need to delete them
-- (You can comment this out if you want to handle them manually)
DELETE FROM public.profiles 
WHERE user_id IS NULL;

-- Step 5: Now safely add the NOT NULL constraint
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- Step 6: Add unique constraint
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Step 7: Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 8: Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;

-- Step 9: Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Step 10: Show final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position; 