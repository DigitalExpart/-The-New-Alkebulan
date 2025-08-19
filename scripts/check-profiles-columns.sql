-- Check Profiles Columns
-- This will show us exactly what columns exist

-- 1. Check what columns are in the profiles table
SELECT 
    attname as column_name,
    format_type(atttypid, atttypmod) as data_type
FROM pg_attribute 
WHERE attrelid = 'public.profiles'::regclass
AND attnum > 0 
AND NOT attisdropped
ORDER BY attnum;

-- 2. Show a sample profile record
SELECT * FROM public.profiles LIMIT 1;

-- 3. Check if you exist in auth.users
SELECT 
    'Your User Info:' as info
UNION ALL
SELECT 'User ID: ' || id
UNION ALL
SELECT 'Email: ' || email
FROM auth.users 
WHERE email = 'ro.osemwengie@gmail.com';
