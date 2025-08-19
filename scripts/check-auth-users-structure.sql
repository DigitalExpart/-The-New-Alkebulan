-- Check Auth Users Structure
-- This will show us exactly what columns exist in auth.users

-- 1. Check what columns are in the auth.users table
SELECT 
    attname as column_name,
    format_type(atttypid, atttypmod) as data_type
FROM pg_attribute 
WHERE attrelid = 'auth.users'::regclass
AND attnum > 0 
AND NOT attisdropped
ORDER BY attnum;

-- 2. Show a sample user record to see the structure
SELECT * FROM auth.users LIMIT 1;

-- 3. Check if we can find your email
SELECT 
    'Your User Check:' as info
UNION ALL
SELECT 'Can find email: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = 'ro.osemwengie@gmail.com'
    ) THEN 'YES' ELSE 'NO' END;
