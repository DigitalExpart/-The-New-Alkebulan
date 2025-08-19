-- Fix Profile - Working Version
-- This will create your profile so you can create communities and posts

-- Step 1: Check if you have a profile
SELECT 
    'Profile Check:' as info
UNION ALL
SELECT 'Has Profile: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2'
    ) THEN 'YES' ELSE 'NO' END;

-- Step 2: Create your profile
INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    email,
    created_at,
    updated_at
) VALUES (
    '41c785f0-63c7-4f25-9727-84550e28bfb2', -- Your user ID
    'Roger', -- Your first name
    'Osemwengie', -- Your last name
    'ro.osemwengie@gmail.com',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Step 3: Verify your profile was created
SELECT 
    'Profile Created:' as info
UNION ALL
SELECT 'User ID: ' || user_id
UNION ALL
SELECT 'Name: ' || first_name || ' ' || last_name
UNION ALL
SELECT 'Email: ' || email
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 4: Test community creation
INSERT INTO public.communities (
    name,
    description,
    category,
    created_by,
    member_count,
    status
) VALUES (
    'Test Community - Working',
    'This is a test community to verify everything works',
    'Technology',
    '41c785f0-63c7-4f25-9727-84550e28bfb2',
    1,
    'active'
) RETURNING id, name, created_by;

-- Step 5: Clean up test data
DELETE FROM public.communities WHERE name = 'Test Community - Working';
