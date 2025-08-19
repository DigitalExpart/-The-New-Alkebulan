-- Check Profiles Table Structure
-- This will show us what columns actually exist in the profiles table

-- 1. Check if profiles table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- 2. Check the exact structure of profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if there are any profiles at all
SELECT 
    'Total Profiles:' as info,
    COUNT(*) as count
FROM public.profiles;

-- 4. Check what the primary key is
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.table_schema = 'public'
AND tc.constraint_type = 'PRIMARY KEY';

-- 5. Show a sample profile record (if any exist)
SELECT * FROM public.profiles LIMIT 1;
