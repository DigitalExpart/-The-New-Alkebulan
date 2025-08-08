-- Fix Posts Table Schema
-- This script adds missing columns to the posts table

-- ============================================================================
-- STEP 1: CHECK CURRENT TABLE STRUCTURE
-- ============================================================================

-- Show current posts table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;

-- ============================================================================
-- STEP 2: ADD MISSING COLUMNS
-- ============================================================================

-- Add privacy column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'privacy'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN privacy VARCHAR(20) DEFAULT 'public';
        RAISE NOTICE 'Added privacy column to posts table';
    ELSE
        RAISE NOTICE 'Privacy column already exists';
    END IF;
END $$;

-- Add post_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'post_type'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN post_type VARCHAR(20) DEFAULT 'text';
        RAISE NOTICE 'Added post_type column to posts table';
    ELSE
        RAISE NOTICE 'Post_type column already exists';
    END IF;
END $$;

-- Add image_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url column to posts table';
    ELSE
        RAISE NOTICE 'Image_url column already exists';
    END IF;
END $$;

-- Add metadata column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN metadata JSONB DEFAULT '{}';
        RAISE NOTICE 'Added metadata column to posts table';
    ELSE
        RAISE NOTICE 'Metadata column already exists';
    END IF;
END $$;

-- Add is_pinned column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'is_pinned'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN is_pinned BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_pinned column to posts table';
    ELSE
        RAISE NOTICE 'Is_pinned column already exists';
    END IF;
END $$;

-- Add is_archived column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'is_archived'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN is_archived BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_archived column to posts table';
    ELSE
        RAISE NOTICE 'Is_archived column already exists';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to posts table';
    ELSE
        RAISE NOTICE 'Updated_at column already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: ADD CHECK CONSTRAINTS
-- ============================================================================

-- Add check constraint for privacy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'posts_privacy_check'
    ) THEN
        ALTER TABLE public.posts ADD CONSTRAINT posts_privacy_check 
        CHECK (privacy IN ('public', 'friends', 'private'));
        RAISE NOTICE 'Added privacy check constraint';
    ELSE
        RAISE NOTICE 'Privacy check constraint already exists';
    END IF;
END $$;

-- Add check constraint for post_type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'posts_post_type_check'
    ) THEN
        ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check 
        CHECK (post_type IN ('text', 'image', 'link', 'poll'));
        RAISE NOTICE 'Added post_type check constraint';
    ELSE
        RAISE NOTICE 'Post_type check constraint already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: VERIFY THE FIX
-- ============================================================================

-- Show updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;

-- Show check constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.posts'::regclass 
AND contype = 'c';

-- Success message
SELECT 'Posts table schema has been fixed! All required columns should now be present.' as result; 