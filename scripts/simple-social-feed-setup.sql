-- Simple Social Feed Setup (Fixed Version)
-- This script creates the social feed tables without referencing non-existent columns

-- ============================================================================
-- POSTS TABLE (Simplified)
-- ============================================================================
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

-- ============================================================================
-- LIKES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SHARES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.post_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    share_type VARCHAR(20) DEFAULT 'repost' CHECK (share_type IN ('repost', 'quote', 'external')),
    share_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, share_type)
);

-- ============================================================================
-- COMMENT LIKES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SIMPLE RLS POLICIES (No complex privacy checks for now)
-- ============================================================================

-- Posts: Allow all authenticated users to view, create, update, delete their own
CREATE POLICY "Allow users to view all posts" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY "Allow users to create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- Likes: Simple policies
CREATE POLICY "Allow users to view likes" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "Allow users to like posts" ON public.post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to remove likes" ON public.post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Comments: Simple policies
CREATE POLICY "Allow users to view comments" ON public.post_comments
    FOR SELECT USING (true);

CREATE POLICY "Allow users to comment" ON public.post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own comments" ON public.post_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own comments" ON public.post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Shares: Simple policies
CREATE POLICY "Allow users to view shares" ON public.post_shares
    FOR SELECT USING (true);

CREATE POLICY "Allow users to share posts" ON public.post_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own shares" ON public.post_shares
    FOR DELETE USING (auth.uid() = user_id);

-- Comment likes: Simple policies
CREATE POLICY "Allow users to view comment likes" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Allow users to like comments" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to remove comment likes" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts (user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS posts_privacy_idx ON public.posts (privacy);
CREATE INDEX IF NOT EXISTS posts_type_idx ON public.posts (post_type);

CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON public.post_likes (post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON public.post_likes (user_id);

CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON public.post_comments (post_id);
CREATE INDEX IF NOT EXISTS post_comments_user_id_idx ON public.post_comments (user_id);
CREATE INDEX IF NOT EXISTS post_comments_parent_idx ON public.post_comments (parent_comment_id);

CREATE INDEX IF NOT EXISTS post_shares_post_id_idx ON public.post_shares (post_id);
CREATE INDEX IF NOT EXISTS post_shares_user_id_idx ON public.post_shares (user_id);

CREATE INDEX IF NOT EXISTS comment_likes_comment_id_idx ON public.comment_likes (comment_id);
CREATE INDEX IF NOT EXISTS comment_likes_user_id_idx ON public.comment_likes (user_id);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE OR REPLACE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SIMPLE VIEW FOR POSTS WITH STATS
-- ============================================================================
CREATE OR REPLACE VIEW public.posts_with_stats AS
SELECT 
    p.*,
    prof.full_name as author_name,
    prof.avatar_url as author_avatar,
    COALESCE(likes.like_count, 0) as like_count,
    COALESCE(comments.comment_count, 0) as comment_count,
    COALESCE(shares.share_count, 0) as share_count
FROM public.posts p
LEFT JOIN public.profiles prof ON p.user_id = prof.user_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count 
    FROM public.post_likes 
    GROUP BY post_id
) likes ON p.id = likes.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count 
    FROM public.post_comments 
    GROUP BY post_id
) comments ON p.id = comments.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as share_count 
    FROM public.post_shares 
    GROUP BY post_id
) shares ON p.id = shares.post_id;

-- Success message
SELECT 'Simple social feed setup completed successfully!' as result; 