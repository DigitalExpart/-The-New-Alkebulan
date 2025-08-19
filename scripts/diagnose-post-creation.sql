-- Diagnose Post Creation Issues
-- This script will help identify why posts can't be created

-- 1. Check if community_posts table exists and its structure
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'community_posts' 
AND table_schema = 'public';

-- 2. Check the exact structure of community_posts table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'community_posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled on community_posts
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'community_posts';

-- 4. Check RLS policies on community_posts
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'community_posts';

-- 5. Check if the user can actually insert into community_posts
-- (This will show what the current user can do)
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'community_posts'
AND table_schema = 'public';

-- 6. Check if there are any constraints that might be blocking inserts
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'community_posts'
AND table_schema = 'public';

-- 7. Check if the community_members table exists and has the right structure
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'community_members' 
AND table_schema = 'public';

-- 8. Check community_members structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'community_members' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Check if there are any sample records in communities and community_members
SELECT 'communities' as table_name, count(*) as record_count FROM public.communities
UNION ALL
SELECT 'community_members' as table_name, count(*) as record_count FROM public.community_members
UNION ALL
SELECT 'community_posts' as table_name, count(*) as record_count FROM public.community_posts;

-- 10. Check the current user context
SELECT current_user, current_database(), session_user;
