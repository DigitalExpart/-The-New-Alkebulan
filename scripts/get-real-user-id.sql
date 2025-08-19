-- Get Real User ID for Testing
-- This will help us test community creation with a valid user

-- 1. Show all users with their IDs
SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Show user count
SELECT 
    'Total users:' as info,
    COUNT(*) as count
FROM auth.users;

-- 3. Check if there are any profiles for these users
SELECT 
    u.id as user_id,
    u.email,
    p.first_name,
    p.last_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;
