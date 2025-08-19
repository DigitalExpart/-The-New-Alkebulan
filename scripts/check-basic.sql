-- Basic Check - Simple Queries
-- This will work in any Supabase version

-- 1. Check what tables exist in public schema
SELECT 
    tablename as table_name,
    tableowner as owner
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'communities', 'community_posts')
ORDER BY tablename;

-- 2. Check what tables exist in auth schema
SELECT 
    tablename as table_name,
    tableowner as owner
FROM pg_tables 
WHERE schemaname = 'auth'
AND tablename = 'users'
ORDER BY tablename;

-- 3. Check profiles table columns (if it exists)
SELECT 
    attname as column_name,
    format_type(atttypid, atttypmod) as data_type
FROM pg_attribute 
WHERE attrelid = 'public.profiles'::regclass
AND attnum > 0 
AND NOT attisdropped
ORDER BY attnum;

-- 4. Check auth.users table columns (if it exists)
SELECT 
    attname as column_name,
    format_type(atttypid, atttypmod) as data_type
FROM pg_attribute 
WHERE attrelid = 'auth.users'::regclass
AND attnum > 0 
AND NOT attisdropped
ORDER BY attnum;
