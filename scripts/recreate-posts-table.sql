-- Nuclear Option: Recreate Posts Table
-- This script completely drops and recreates the posts table with the correct structure
-- WARNING: This will delete all existing data in the posts table!

-- ============================================================================
-- STEP 1: BACKUP WARNING
-- ============================================================================

-- Check if there's any data to backup
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ WARNING: ' || COUNT(*) || ' posts will be deleted!'
        ELSE '✅ No existing posts to backup'
    END as backup_warning
FROM public.posts;

-- ============================================================================
-- STEP 2: DROP EXISTING TABLE AND DEPENDENCIES
-- ============================================================================

-- Drop dependent tables first (if they exist)
DROP TABLE IF EXISTS public.comment_likes CASCADE;
DROP TABLE IF EXISTS public.post_shares CASCADE;
DROP TABLE IF EXISTS public.post_comments CASCADE;
DROP TABLE IF EXISTS public.post_likes CASCADE;

-- Drop the posts table
DROP TABLE IF EXISTS public.posts CASCADE;

-- ============================================================================
-- STEP 3: CREATE POSTS TABLE WITH CORRECT STRUCTURE
-- ============================================================================

CREATE TABLE public.posts (
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

-- ============================================================================
-- STEP 4: CREATE RELATED TABLES
-- ============================================================================

-- Create post_likes table
CREATE TABLE public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_shares table
CREATE TABLE public.post_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    share_type VARCHAR(20) DEFAULT 'repost' CHECK (share_type IN ('repost', 'quote', 'external')),
    share_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, share_type)
);

-- Create comment_likes table
CREATE TABLE public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- ============================================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: CREATE RLS POLICIES
-- ============================================================================

-- Posts policies
CREATE POLICY "Public posts are viewable by everyone" ON public.posts
    FOR SELECT USING (privacy = 'public');

CREATE POLICY "Users can view their own posts" ON public.posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Users can view likes on visible posts" ON public.post_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_likes.post_id 
            AND (posts.privacy = 'public' OR posts.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can like visible posts" ON public.post_likes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_id 
            AND (posts.privacy = 'public' OR posts.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can remove their own likes" ON public.post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view comments on visible posts" ON public.post_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_comments.post_id 
            AND (posts.privacy = 'public' OR posts.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can comment on visible posts" ON public.post_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_id 
            AND (posts.privacy = 'public' OR posts.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can update own comments" ON public.post_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Shares policies
CREATE POLICY "Users can view shares on visible posts" ON public.post_shares
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_shares.post_id 
            AND (posts.privacy = 'public' OR posts.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can share visible posts" ON public.post_shares
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_id 
            AND (posts.privacy = 'public' OR posts.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can delete own shares" ON public.post_shares
    FOR DELETE USING (auth.uid() = user_id);

-- Comment likes policies
CREATE POLICY "Users can view comment likes" ON public.comment_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.post_comments 
            JOIN public.posts ON posts.id = post_comments.post_id
            WHERE post_comments.id = comment_likes.comment_id 
            AND (posts.privacy = 'public' OR posts.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can like comments" ON public.comment_likes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.post_comments 
            JOIN public.posts ON posts.id = post_comments.post_id
            WHERE post_comments.id = comment_id 
            AND (posts.privacy = 'public' OR posts.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can remove comment likes" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 7: CREATE INDEXES
-- ============================================================================

-- Posts indexes
CREATE INDEX posts_user_id_idx ON public.posts (user_id);
CREATE INDEX posts_created_at_idx ON public.posts (created_at DESC);
CREATE INDEX posts_privacy_idx ON public.posts (privacy);
CREATE INDEX posts_type_idx ON public.posts (post_type);

-- Likes indexes
CREATE INDEX post_likes_post_id_idx ON public.post_likes (post_id);
CREATE INDEX post_likes_user_id_idx ON public.post_likes (user_id);

-- Comments indexes
CREATE INDEX post_comments_post_id_idx ON public.post_comments (post_id);
CREATE INDEX post_comments_user_id_idx ON public.post_comments (user_id);
CREATE INDEX post_comments_parent_idx ON public.post_comments (parent_comment_id);

-- Shares indexes
CREATE INDEX post_shares_post_id_idx ON public.post_shares (post_id);
CREATE INDEX post_shares_user_id_idx ON public.post_shares (user_id);

-- Comment likes indexes
CREATE INDEX comment_likes_comment_id_idx ON public.comment_likes (comment_id);
CREATE INDEX comment_likes_user_id_idx ON public.comment_likes (user_id);

-- ============================================================================
-- STEP 8: CREATE TRIGGERS
-- ============================================================================

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 9: VERIFICATION
-- ============================================================================

-- Show all created tables
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = table_name) 
        THEN '✅ Created' 
        ELSE '❌ Failed' 
    END as status
FROM (VALUES ('posts'), ('post_likes'), ('post_comments'), ('post_shares'), ('comment_likes')) AS t(table_name);

-- Show posts table structure
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
    AND tc.table_name IN ('posts', 'post_likes', 'post_comments', 'post_shares', 'comment_likes')
ORDER BY tc.table_name, tc.constraint_name;

-- Success message
SELECT 'Posts table and all related tables have been completely recreated with the correct structure!' as result; 