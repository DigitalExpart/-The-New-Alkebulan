-- Fix User Profile
-- This will create/update your profile so you can create communities

-- 1. First, let's see what we're working with
SELECT 
    'Current Status:' as info
UNION ALL
SELECT 'User ID: ' || id
UNION ALL
SELECT 'Email: ' || email
FROM auth.users 
WHERE email = 'ro.osemwengie@gmail.com';

-- 2. Create or update your profile
INSERT INTO public.profiles (
    id,
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
ON CONFLICT (id) 
DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- 3. Verify the profile was created/updated
SELECT 
    'Profile Updated:' as info
UNION ALL
SELECT 'ID: ' || id
UNION ALL
SELECT 'Name: ' || first_name || ' ' || last_name
UNION ALL
SELECT 'Email: ' || email
FROM public.profiles 
WHERE id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- 4. Test community creation with your real user ID
INSERT INTO public.communities (
    name,
    description,
    category,
    created_by,
    member_count,
    status
) VALUES (
    'Test Community - Fixed Profile',
    'This is a test community to verify profile fix works',
    'Technology',
    '41c785f0-63c7-4f25-9727-84550e28bfb2', -- Your real user ID
    1,
    'active'
) RETURNING id, name, created_by;

-- 5. Clean up test data
DELETE FROM public.communities WHERE name = 'Test Community - Fixed Profile';
