-- Fix role toggle issue - remove automatic role synchronization
-- This script removes any triggers or functions that automatically update role fields
-- when account_type changes, ensuring Role Management has complete control

-- Step 1: Check for any triggers that might be interfering
SELECT 
    'Current triggers on profiles table' as section,
    t.tgname as trigger_name,
    t.tgtype,
    p.proname as function_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.profiles'::regclass;

-- Step 2: Check for any functions that might be updating role fields automatically
SELECT 
    'Functions that might auto-update roles' as section,
    p.proname as function_name,
    p.prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND (
    p.prosrc ILIKE '%account_type%' 
    AND p.prosrc ILIKE '%business_enabled%'
    OR p.prosrc ILIKE '%account_type%' 
    AND p.prosrc ILIKE '%buyer_enabled%'
    OR p.prosrc ILIKE '%account_type%' 
    AND p.prosrc ILIKE '%creator_enabled%'
    OR p.prosrc ILIKE '%account_type%' 
    AND p.prosrc ILIKE '%investor_enabled%'
    OR p.prosrc ILIKE '%account_type%' 
    AND p.prosrc ILIKE '%mentor_enabled%'
)
ORDER BY p.proname;

-- Step 3: Drop any problematic triggers (we'll recreate them without role sync)
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT t.tgname, p.proname
        FROM pg_trigger t
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE t.tgrelid = 'public.profiles'::regclass
        AND p.prosrc ILIKE '%account_type%'
        AND (
            p.prosrc ILIKE '%business_enabled%'
            OR p.prosrc ILIKE '%buyer_enabled%'
            OR p.prosrc ILIKE '%creator_enabled%'
            OR p.prosrc ILIKE '%investor_enabled%'
            OR p.prosrc ILIKE '%mentor_enabled%'
        )
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_rec.tgname || ' ON public.profiles';
        RAISE NOTICE 'Dropped trigger: %', trigger_rec.tgname;
    END LOOP;
END $$;

-- Step 4: Drop any problematic functions
DO $$
DECLARE
    func_rec RECORD;
BEGIN
    FOR func_rec IN 
        SELECT p.proname
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.prosrc ILIKE '%account_type%'
        AND (
            p.prosrc ILIKE '%business_enabled%'
            OR p.prosrc ILIKE '%buyer_enabled%'
            OR p.prosrc ILIKE '%creator_enabled%'
            OR p.prosrc ILIKE '%investor_enabled%'
            OR p.prosrc ILIKE '%mentor_enabled%'
        )
        AND p.proname != 'handle_new_user'  -- Don't drop the new user function
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_rec.proname || ' CASCADE';
        RAISE NOTICE 'Dropped function: %', func_rec.proname;
    END LOOP;
END $$;

-- Step 5: Ensure buyer_enabled is always true (default role)
UPDATE public.profiles 
SET buyer_enabled = true 
WHERE buyer_enabled = false OR buyer_enabled IS NULL;

-- Step 6: Create a clean handle_new_user function without role synchronization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    first_name, 
    last_name, 
    username, 
    avatar_url, 
    is_public, 
    created_at, 
    updated_at, 
    buyer_enabled,
    business_enabled,
    creator_enabled, 
    investor_enabled, 
    mentor_enabled
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', SPLIT_PART(COALESCE(new.raw_user_meta_data->>'full_name', new.email), ' ', 1)),
    COALESCE(new.raw_user_meta_data->>'last_name', CASE 
      WHEN new.raw_user_meta_data->>'full_name' IS NOT NULL AND new.raw_user_meta_data->>'full_name' != '' THEN
        SUBSTRING(new.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN new.raw_user_meta_data->>'full_name') + 1)
      ELSE ''
    END),
    COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    true,
    NOW(),
    NOW(),
    true,   -- buyer_enabled always true (default role)
    false,  -- business_enabled defaults to false
    false,  -- creator_enabled defaults to false
    false,  -- investor_enabled defaults to false
    false   -- mentor_enabled defaults to false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Verify the fix
SELECT 
    'Role toggle fix applied successfully!' as message,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_enabled_count,
    COUNT(CASE WHEN business_enabled = true THEN 1 END) as business_enabled_count,
    COUNT(CASE WHEN creator_enabled = true THEN 1 END) as creator_enabled_count
FROM public.profiles;

-- Step 8: Show current state for your profile
SELECT 
    'Your current profile state' as section,
    id,
    user_id,
    email,
    account_type,
    buyer_enabled,
    business_enabled,
    creator_enabled,
    investor_enabled,
    mentor_enabled
FROM public.profiles 
WHERE email = 'jumatomosanya@gmail.com';  -- Replace with your email
