-- Add missing language_preference column to profiles table
-- This script fixes the "Could not find the 'language_preference' column" error

-- 1. Add language_preference column if it doesn't exist
DO $$ 
BEGIN
    -- Add language_preference column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'language_preference') THEN
        ALTER TABLE public.profiles ADD COLUMN language_preference TEXT[] DEFAULT ARRAY['English'];
        RAISE NOTICE 'Added language_preference column with default value';
    ELSE
        RAISE NOTICE 'language_preference column already exists';
    END IF;
END $$;

-- 2. Update existing profiles to have a default language preference if NULL
UPDATE public.profiles 
SET language_preference = ARRAY['English'] 
WHERE language_preference IS NULL;

-- 3. Show current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Show sample profiles with language preferences
SELECT 
    id,
    full_name,
    language_preference,
    created_at
FROM public.profiles 
LIMIT 5;

-- 5. Success message
SELECT 'language_preference column added successfully! Profile creation should now work.' as result;
