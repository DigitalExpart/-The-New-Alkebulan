-- Cleanup Duplicate Profiles
-- This script helps resolve duplicate profile issues

-- Step 1: Check for duplicate profiles
SELECT 
    user_id,
    COUNT(*) as profile_count
FROM public.profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Step 2: Check for profiles with null or invalid data
SELECT 
    id,
    user_id,
    email,
    first_name,
    last_name,
    created_at
FROM public.profiles 
WHERE user_id IS NULL 
   OR email IS NULL 
   OR first_name IS NULL 
   OR last_name IS NULL;

-- Step 3: Show all profiles for the current user (replace with actual user ID)
-- Replace 'a99c4d5c-6e39-4f63-b687-d001e492578a' with the actual user ID from the error
SELECT 
    id,
    user_id,
    email,
    first_name,
    last_name,
    created_at,
    updated_at
FROM public.profiles 
WHERE user_id = 'a99c4d5c-6e39-4f63-b687-d001e492578a'
ORDER BY created_at DESC;

-- Step 4: If there are duplicates, you can clean them up manually
-- WARNING: Only run this if you're sure you want to delete duplicate profiles
-- Uncomment the lines below if needed:

-- DELETE FROM public.profiles 
-- WHERE id IN (
--     SELECT id FROM (
--         SELECT id, 
--                ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
--         FROM public.profiles
--     ) t 
--     WHERE rn > 1
-- );

-- Step 5: Verify cleanup
SELECT 'Profile cleanup analysis complete. Check the results above.' as result;
