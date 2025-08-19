-- Check Everything - No Assumptions
-- This will show us what actually exists

-- 1. Check what tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
AND table_name IN ('users', 'profiles', 'communities', 'community_posts')
ORDER BY table_schema, table_name;

-- 2. Check profiles table structure (if it exists)
SELECT 
    'Profiles Table Columns:' as info
UNION ALL
SELECT column_name || ' (' || data_type || ')'
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check auth.users table structure (if it exists)
SELECT 
    'Auth Users Table Columns:' as info
UNION ALL
SELECT column_name || ' (' || data_type || ')'
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 4. Show sample data from profiles (if it exists)
SELECT 
    'Sample Profile Data:' as info
UNION ALL
SELECT 'Has profiles table: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles' AND table_schema = 'public'
    ) THEN 'YES' ELSE 'NO' END;
