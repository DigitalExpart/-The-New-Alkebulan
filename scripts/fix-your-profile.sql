-- Fix Your Profile
-- This will check and fix your specific profile so you can create communities

-- 1. Check if you have a profile
SELECT 
    'Profile Check:' as info
UNION ALL
SELECT 'Has Profile: ' || CASE WHEN p.id IS NOT NULL THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 'Profile ID: ' || COALESCE(p.id::text, 'NULL')
UNION ALL
SELECT 'First Name: ' || COALESCE(p.first_name, 'NULL')
UNION ALL
SELECT 'Last Name: ' || COALESCE(p.last_name, 'NULL')
UNION ALL
SELECT 'Email: ' || COALESCE(p.email, 'NULL')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'ro.osemwengie@gmail.com';

-- 2. Create your profile if it doesn't exist
INSERT INTO public.profiles (
    id,
    user_id,
    first_name,
    last_name,
    email,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(), -- Generate a new UUID for the profile
    '41c785f0-63c7-4f25-9727-84550e28bfb2', -- Your user ID from auth.users
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

-- 3. Verify your profile was created/updated
SELECT 
    'Profile Updated:' as info
UNION ALL
SELECT 'ID: ' || id
UNION ALL
SELECT 'User ID: ' || user_id
UNION ALL
SELECT 'Name: ' || first_name || ' ' || last_name
UNION ALL
SELECT 'Email: ' || email
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

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
