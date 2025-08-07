-- Diagnostic script to check the current state of the profiles table

-- Check if the table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'profiles' 
            AND table_schema = 'public'
        ) THEN 'Table EXISTS'
        ELSE 'Table DOES NOT EXIST'
    END as table_status;

-- Show all columns in the profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if user_id column exists specifically
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'user_id'
            AND table_schema = 'public'
        ) THEN 'user_id column EXISTS'
        ELSE 'user_id column DOES NOT EXIST'
    END as user_id_status;

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Check existing policies
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
WHERE tablename = 'profiles'; 