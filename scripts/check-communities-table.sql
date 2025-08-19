-- Check Communities Table Structure
-- This will help identify why community creation is failing

-- 1. Check if communities table exists and its structure
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'communities' 
AND table_schema = 'public';

-- 2. Check the exact structure of communities table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'communities' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled on communities
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'communities';

-- 4. Check RLS policies on communities
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'communities';

-- 5. Check if there are any constraints that might be blocking inserts
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'communities'
AND table_schema = 'public';

-- 6. Check if the user can actually insert into communities
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'communities'
AND table_schema = 'public';
