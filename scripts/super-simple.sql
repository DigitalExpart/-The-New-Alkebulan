-- Super Simple Check
-- Just basic table existence

-- 1. Check if profiles table exists
SELECT 
    'Profiles table exists:' as info,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    ) THEN 'YES' ELSE 'NO' END as exists;

-- 2. Check if auth.users table exists
SELECT 
    'Auth users table exists:' as info,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'auth' AND tablename = 'users'
    ) THEN 'YES' ELSE 'NO' END as exists;

-- 3. Try to see what's in profiles (if it exists)
SELECT 
    'Profiles table content:' as info
UNION ALL
SELECT 'Table exists: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    ) THEN 'YES' ELSE 'NO' END;

-- 4. Try to see what's in auth.users (if it exists)
SELECT 
    'Auth users table content:' as info
UNION ALL
SELECT 'Table exists: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'auth' AND tablename = 'users'
    ) THEN 'YES' ELSE 'NO' END;
