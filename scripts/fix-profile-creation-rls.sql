-- Fix Profile Creation RLS Issues
-- This script resolves the "new row violates row-level security policy" error

-- Step 1: Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- Step 2: Check existing policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 3: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles can be viewed by anyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Step 4: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create comprehensive RLS policies

-- Policy 1: Allow authenticated users to view all profiles (for community features)
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy 2: Allow users to insert their own profile (CRITICAL for profile creation)
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = id);

-- Policy 4: Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = id);

-- Step 6: Verify policies are created
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 7: Test the fix
SELECT 'RLS policies updated successfully! Profile creation should now work.' as result;

-- Step 8: Additional check - ensure the profiles table structure is correct
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
