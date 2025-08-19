-- Get User ID and Fix Profile
-- This will get your actual user ID and fix your profile

-- Step 1: Get your actual user ID from auth.users
SELECT 
    'Your User Info:' as info
UNION ALL
SELECT 'User ID: ' || id
UNION ALL
SELECT 'Email: ' || email
FROM auth.users 
WHERE email = 'ro.osemwengie@gmail.com';

-- Step 2: Create your profile using the correct structure
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
    (SELECT id FROM auth.users WHERE email = 'ro.osemwengie@gmail.com'), -- Get your actual User ID
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
