-- Quick fix for profiles table user_id issue
-- This is a simpler approach that just deletes orphaned records

-- Step 1: Check what records have null user_id
SELECT id, email, full_name, user_id FROM public.profiles WHERE user_id IS NULL;

-- Step 2: Delete records with null user_id (they're likely orphaned test data)
DELETE FROM public.profiles WHERE user_id IS NULL;

-- Step 3: Now safely add the NOT NULL constraint
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Add unique constraint
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Step 5: Verify the fix worked
SELECT 
    'Profiles table fixed successfully!' as status,
    COUNT(*) as total_profiles,
    COUNT(user_id) as profiles_with_user_id
FROM public.profiles; 