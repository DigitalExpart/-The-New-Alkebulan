-- EMERGENCY FIX: Make RLS policies permissive for profile creation
-- This script temporarily makes RLS policies very permissive to fix the immediate issue

-- Step 1: Drop ALL existing policies on profiles table
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Step 2: Create very permissive policies for authenticated users

-- Allow authenticated users to do everything with profiles
CREATE POLICY "Authenticated users full access" ON public.profiles
    FOR ALL USING (auth.role() = 'authenticated');

-- Step 3: Verify the policy was created
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 4: Test message
SELECT 'Emergency RLS fix applied! All authenticated users now have full access to profiles table.' as result;
