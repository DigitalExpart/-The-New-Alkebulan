-- Fix Row-Level Security (RLS) policies for profiles table
-- This script fixes the "new row violates row-level security policy" error

-- Step 1: Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (to recreate them properly)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Step 3: Create proper RLS policies for authenticated users

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Create a policy for public viewing (optional - for public profiles)
-- This allows other users to view profiles marked as public
CREATE POLICY "Public profiles can be viewed by anyone" ON public.profiles
    FOR SELECT USING (is_public = true);

-- Step 5: Verify the policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 6: Test message
SELECT 'RLS policies fixed! Users should now be able to create and manage their profiles.' as result;
