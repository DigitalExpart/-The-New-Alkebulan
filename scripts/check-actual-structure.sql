-- Check Actual Profiles Table Structure
-- This will show us exactly what columns exist

-- 1. Show all columns in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Show a sample profile record to see the actual structure
SELECT * FROM public.profiles LIMIT 1;

-- 3. Check what the primary key is
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
