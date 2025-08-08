-- Quick Fix for Privacy Column Error
-- Run this if you get "column 'privacy' does not exist" error

-- Check if posts table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') 
        THEN '✅ Posts table exists' 
        ELSE '❌ Posts table does not exist - creating it' 
    END as posts_table_status;

-- Create posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    post_type VARCHAR(20) DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'link', 'poll')),
    privacy VARCHAR(20) DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private')),
    metadata JSONB DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If table exists but is missing the privacy column, add it
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'posts'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'privacy'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN privacy VARCHAR(20) DEFAULT 'public';
        RAISE NOTICE 'Added missing privacy column to existing posts table';
    ELSE
        RAISE NOTICE 'Privacy column already exists or table was just created';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
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

-- Verify the fix
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;

-- Success message
SELECT 'Privacy column issue has been fixed! Posts table should now have all required columns.' as result; 