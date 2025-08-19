-- Fix Profile - Correct Structure
-- This will create your profile with both id and user_id properly set

-- Step 1: Get your user ID from auth.users
SELECT 
    'Your User Info:' as info
UNION ALL
SELECT 'User ID: ' || id
UNION ALL
SELECT 'Email: ' || email
FROM auth.users 
WHERE email = 'ro.osemwengie@gmail.com';

-- Step 2: Create your profile with correct structure
INSERT INTO public.profiles (
    id,
    user_id,
    full_name,
    first_name,
    last_name,
    email,
    created_at,
    updated_at
) VALUES (
    'bd55f9a6-ea51-4c3a-aa72-00a1697e79d2', -- Your Profile ID from dashboard
    '41c785f0-63c7-4f25-9727-84550e28bfb2', -- Your User ID from auth.users
    'Roger Osemwengie', -- Full name
    'Roger', -- First name
    'Osemwengie', -- Last name
    'ro.osemwengie@gmail.com',
    NOW(),
    NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Step 3: Verify your profile was created
SELECT 
    'Profile Created:' as info
UNION ALL
SELECT 'Profile ID: ' || id
UNION ALL
SELECT 'User ID: ' || user_id
UNION ALL
SELECT 'Name: ' || COALESCE(first_name, 'NULL') || ' ' || COALESCE(last_name, 'NULL')
UNION ALL
SELECT 'Email: ' || COALESCE(email, 'NULL')
FROM public.profiles 
WHERE id = 'bd55f9a6-ea51-4c3a-aa72-00a1697e79d2';

-- Step 4: Test community creation
INSERT INTO public.communities (
    name,
    description,
    category,
    created_by,
    member_count,
    status
) VALUES (
    'Test Community - Working Profile',
    'This is a test community to verify profile fix works',
    'Technology',
    '41c785f0-63c7-4f25-9727-84550e28bfb2', -- Your User ID
    1,
    'active'
) RETURNING id, name, created_by;

-- Step 5: Clean up test data
DELETE FROM public.communities WHERE name = 'Test Community - Working Profile';
