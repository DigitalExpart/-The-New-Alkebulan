-- Fix foreign key constraints on profiles table
-- This script removes incorrect constraints and sets up the correct ones

-- Check current constraints
SELECT 
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.referential_constraints rc 
    ON kcu.constraint_name = rc.constraint_name
JOIN information_schema.key_column_usage kcu2 
    ON rc.unique_constraint_name = kcu2.constraint_name
WHERE kcu.table_name = 'profiles'
AND kcu.table_schema = 'public';

-- Drop the incorrect foreign key constraint on id column
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Also drop any other potentially problematic constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add the correct foreign key constraint on user_id column
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Verify the fix
SELECT 
    'Foreign key constraints fixed successfully!' as status,
    COUNT(*) as total_profiles
FROM public.profiles;

-- Show current constraints after fix
SELECT 
    constraint_name,
    table_name,
    column_name
FROM information_schema.key_column_usage 
WHERE table_name = 'profiles'
AND table_schema = 'public'
AND constraint_name LIKE '%fkey%'; 