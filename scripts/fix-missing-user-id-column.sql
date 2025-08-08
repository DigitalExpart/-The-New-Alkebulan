-- Fix Missing user_id Column in Posts Table
-- This script adds the missing user_id column and fixes the table structure

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
-- STEP 2: ADD MISSING user_id COLUMN
-- ============================================================================

-- Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN user_id UUID;
        RAISE NOTICE 'Added user_id column to posts table';
        
        -- Add foreign key constraint
        ALTER TABLE public.posts 
        ADD CONSTRAINT posts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for user_id';
        
        -- Make user_id NOT NULL after adding it
        ALTER TABLE public.posts ALTER COLUMN user_id SET NOT NULL;
        RAISE NOTICE 'Made user_id NOT NULL';
        
    ELSE
        RAISE NOTICE 'User_id column already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: ADD OTHER MISSING COLUMNS
-- ============================================================================

-- Add content column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'content'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN content TEXT NOT NULL;
        RAISE NOTICE 'Added content column to posts table';
    ELSE
        RAISE NOTICE 'Content column already exists';
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

-- Add created_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to posts table';
    ELSE
        RAISE NOTICE 'Created_at column already exists';
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
-- STEP 4: ADD CHECK CONSTRAINTS
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
-- STEP 5: ENABLE RLS AND CREATE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
CREATE POLICY "Public posts are viewable by everyone" ON public.posts
    FOR SELECT USING (privacy = 'public');

DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
CREATE POLICY "Users can view their own posts" ON public.posts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
CREATE POLICY "Users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: CREATE INDEXES
-- ============================================================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts (user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS posts_privacy_idx ON public.posts (privacy);

-- ============================================================================
-- STEP 7: VERIFY THE FIX
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

-- Show foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'posts';

-- Success message
SELECT 'User_id column and all other missing columns have been added to the posts table!' as result; 