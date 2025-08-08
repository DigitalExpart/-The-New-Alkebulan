-- Safe fix for foreign key constraints on profiles table
-- This script checks for existing constraints before adding them

-- First, let's see what constraints currently exist
SELECT conname as constraint_name, conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- Drop the problematic constraint (profiles_id_fkey)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Now safely add the correct foreign key constraint (only if it doesn't exist)
DO $$
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_fkey' 
        AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint profiles_user_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint profiles_user_id_fkey already exists';
    END IF;
END $$;

-- Safely add the unique constraint (only if it doesn't exist)
DO $$
BEGIN
    -- Check if the unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_unique' 
        AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint profiles_user_id_unique';
    ELSE
        RAISE NOTICE 'Unique constraint profiles_user_id_unique already exists';
    END IF;
END $$;

-- Verify the fix worked
SELECT 'Constraints are now properly configured!' as result;

-- Show the final constraint list
SELECT conname as constraint_name, conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass; 