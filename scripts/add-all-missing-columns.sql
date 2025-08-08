-- Add ALL missing columns to profiles table
-- This script adds every column that the application expects

-- Check current table structure first
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

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

-- Add email column
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

-- Add is_public column (this was missing!)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_public' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_public BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_public column';
    ELSE
        RAISE NOTICE 'is_public column already exists';
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