-- Add missing columns to profiles table
-- This script adds all columns that the application expects but are missing

-- Check current table structure first
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns one by one (if they don't exist)

-- Add education column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'education' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN education TEXT;
        RAISE NOTICE 'Added education column';
    ELSE
        RAISE NOTICE 'education column already exists';
    END IF;
END $$;

-- Add website column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'website' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN website TEXT;
        RAISE NOTICE 'Added website column';
    ELSE
        RAISE NOTICE 'website column already exists';
    END IF;
END $$;

-- Add occupation column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'occupation' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN occupation TEXT;
        RAISE NOTICE 'Added occupation column';
    ELSE
        RAISE NOTICE 'occupation column already exists';
    END IF;
END $$;

-- Add email column (for consistency with the app)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
        RAISE NOTICE 'Added email column';
    ELSE
        RAISE NOTICE 'email column already exists';
    END IF;
END $$;

-- Show final table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT 'All missing columns have been added successfully!' as result; 