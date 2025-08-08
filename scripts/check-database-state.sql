-- Database State Check Script
-- This script will help identify what's causing the "Database error saving new user" issue

-- Check if the posts table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') 
        THEN '✅ Posts table exists' 
        ELSE '❌ Posts table does not exist' 
    END as posts_table_status;

-- Check if the profiles table exists and its structure
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') 
        THEN '✅ Profiles table exists' 
        ELSE '❌ Profiles table does not exist' 
    END as profiles_table_status;

-- Check profiles table columns if it exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check if there are any foreign key constraints that might be causing issues
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('profiles', 'posts', 'post_likes', 'post_comments', 'post_shares');

-- Check for any RLS policies that might be blocking operations
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'posts', 'post_likes', 'post_comments', 'post_shares')
ORDER BY tablename, policyname;

-- Check if there are any recent errors in the logs (if accessible)
-- This is just a placeholder - actual log access depends on Supabase settings
SELECT 'Check Supabase logs for recent errors' as log_check_note;

-- Summary of what needs to be done
SELECT 
    'If posts table does not exist, run: scripts/social-feed-schema-fixed.sql' as action_1,
    'If profiles table has issues, check the column structure above' as action_2,
    'If RLS policies are blocking, they may need adjustment' as action_3; 