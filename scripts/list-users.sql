-- List all users in the database
-- This will help us test with a real user ID

-- Show all users
SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Show user count
SELECT 
    'Total users:' as info,
    COUNT(*) as count
FROM auth.users;
