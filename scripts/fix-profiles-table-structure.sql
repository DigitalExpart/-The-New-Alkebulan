-- Fix Profiles Table Structure
-- This script ensures the profiles table has all required columns

-- Step 1: Check current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Add missing columns if they don't exist

-- Add is_public column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_public'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add cover_photo_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'cover_photo_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN cover_photo_url TEXT;
    END IF;
END $$;

-- Add core_competencies column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'core_competencies'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN core_competencies TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add goals column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'goals'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN goals TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add achievements column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'achievements'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN achievements TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add challenges column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'challenges'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN challenges TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add community_interests column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'community_interests'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN community_interests TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add certifications column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'certifications'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN certifications TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Step 3: Verify the updated table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: Success message
SELECT 'Profiles table structure updated successfully! All required columns should now exist.' as result;
