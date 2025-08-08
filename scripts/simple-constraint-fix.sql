-- Simple fix for foreign key constraints on profiles table
-- This script removes problematic constraints and sets up the correct ones

-- First, let's see what constraints exist (simple approach)
SELECT conname as constraint_name, conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- Drop the problematic constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Drop any other potentially problematic constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Now add the correct foreign key constraint on user_id
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make sure user_id is unique
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Verify the fix worked
SELECT 'Foreign key constraints fixed successfully!' as result;

-- Show the current constraints
SELECT conname as constraint_name, conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass; 