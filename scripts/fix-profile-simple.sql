-- Simple Profile Fix
-- First check structure, then fix your profile

-- Step 1: Check what columns actually exist in profiles table
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Show a sample profile to see the structure
SELECT * FROM public.profiles LIMIT 1;

-- Step 3: Check if you exist in auth.users
SELECT 
    'Your User Info:' as info
UNION ALL
SELECT 'User ID: ' || id
UNION ALL
SELECT 'Email: ' || email
FROM auth.users 
WHERE email = 'ro.osemwengie@gmail.com';
