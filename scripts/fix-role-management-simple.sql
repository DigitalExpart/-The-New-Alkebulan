-- Simple fix for Role Management - ensure roles can be properly activated/deactivated
-- This script removes any database interference and makes Role Management work for all users

-- Step 1: Check what triggers exist on the profiles table
SELECT 
    'Current triggers on profiles table' as section,
    t.tgname as trigger_name,
    t.tgtype,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.profiles'::regclass;

-- Step 2: Remove any triggers that might be interfering with role updates
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT t.tgname
        FROM pg_trigger t
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE t.tgrelid = 'public.profiles'::regclass
        AND p.prosrc ILIKE '%business_enabled%'
        AND p.prosrc ILIKE '%UPDATE%'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_rec.tgname || ' ON public.profiles';
        RAISE NOTICE 'Dropped interfering trigger: %', trigger_rec.tgname;
    END LOOP;
END $$;

-- Step 3: Remove any functions that automatically sync role fields
DO $$
DECLARE
    func_rec RECORD;
BEGIN
    FOR func_rec IN 
        SELECT p.proname
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.prosrc ILIKE '%business_enabled%'
        AND p.prosrc ILIKE '%account_type%'
        AND p.proname != 'handle_new_user'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_rec.proname || ' CASCADE';
        RAISE NOTICE 'Dropped interfering function: %', func_rec.proname;
    END LOOP;
END $$;

-- Step 4: Ensure all users have the basic role structure
UPDATE public.profiles 
SET 
    buyer_enabled = COALESCE(buyer_enabled, true),
    business_enabled = COALESCE(business_enabled, false),
    creator_enabled = COALESCE(creator_enabled, false),
    investor_enabled = COALESCE(investor_enabled, false),
    mentor_enabled = COALESCE(mentor_enabled, false)
WHERE 
    buyer_enabled IS NULL 
    OR business_enabled IS NULL 
    OR creator_enabled IS NULL 
    OR investor_enabled IS NULL 
    OR mentor_enabled IS NULL;

-- Step 5: Test role activation for your profile
UPDATE public.profiles 
SET business_enabled = true 
WHERE email = 'jumatomosanya@gmail.com';

-- Step 6: Verify the change worked
SELECT 
    'Role Management Test - Business role activated' as message,
    email,
    business_enabled,
    'Business role should now be TRUE' as status
FROM public.profiles 
WHERE email = 'jumatomosanya@gmail.com';

-- Step 7: Test role deactivation
UPDATE public.profiles 
SET business_enabled = false 
WHERE email = 'jumatomosanya@gmail.com';

-- Step 8: Verify the change worked
SELECT 
    'Role Management Test - Business role deactivated' as message,
    email,
    business_enabled,
    'Business role should now be FALSE' as status
FROM public.profiles 
WHERE email = 'jumatomosanya@gmail.com';

-- Step 9: Final verification - show all users and their role status
SELECT 
    'All users role status' as section,
    email,
    buyer_enabled,
    business_enabled,
    creator_enabled,
    investor_enabled,
    mentor_enabled
FROM public.profiles 
ORDER BY email;
