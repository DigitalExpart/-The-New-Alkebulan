-- Check Auth Users Columns
-- This will show us exactly what columns exist in the auth.users table

-- 1. Check what columns are in the auth.users table
SELECT 
    attname as column_name,
    format_type(atttypid, atttypmod) as data_type
FROM pg_attribute 
WHERE attrelid = 'auth.users'::regclass
AND attnum > 0 
AND NOT attisdropped
ORDER BY attnum;

-- 2. Show a sample user record from auth.users
SELECT * FROM auth.users LIMIT 1;
