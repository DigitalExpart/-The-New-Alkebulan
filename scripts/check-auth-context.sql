-- Check Authentication Context
-- This will help us understand what user information is available

-- 1. Check current user context
SELECT 
    'Current user context:' as info
UNION ALL
SELECT 'User ID from auth.uid(): ' || COALESCE(auth.uid()::text, 'NULL')
UNION ALL
SELECT 'Current user: ' || current_user
UNION ALL
SELECT 'Session user: ' || session_user;

-- 2. Check if we can access auth.users table
SELECT 
    'Auth users access:' as info
UNION ALL
SELECT 'Can select from auth.users: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM auth.users LIMIT 1
    ) THEN 'YES' ELSE 'NO' END;

-- 3. Check your specific user
SELECT 
    'Your user info:' as info
UNION ALL
SELECT 'User ID: ' || id
UNION ALL
SELECT 'Email: ' || email
FROM auth.users 
WHERE email = 'ro.osemwengie@gmail.com';
