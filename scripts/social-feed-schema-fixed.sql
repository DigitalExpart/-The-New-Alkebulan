-- Social Feed Database Schema for The New Alkebulan (FIXED VERSION)
-- This script creates all tables needed for the social feed functionality

-- ============================================================================
-- POSTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    post_type VARCHAR(20) DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'link', 'poll')),
    privacy VARCHAR(20) DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private')),
    metadata JSONB DEFAULT '{}', -- For storing extra data like link previews, poll options, etc.
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
    
    -- Ensure one like per user per post
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
    share_content TEXT, -- For quote shares or external share messages
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one share per user per post per type
    UNIQUE(post_id, user_id, share_type)
);

-- ============================================================================
-- COMMENT LIKES TABLE (for liking comments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one like per user per comment
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
-- RLS POLICIES FOR POSTS
-- ============================================================================

-- Posts visibility based on privacy settings
CREATE POLICY "Public posts are viewable by everyone" ON public.posts
    FOR SELECT USING (privacy = 'public');

CREATE POLICY "Users can view their own posts" ON public.posts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own posts
CREATE POLICY "Users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES FOR LIKES
-- ============================================================================

-- Users can view likes on posts they can see
CREATE POLICY "Users can view likes on visible posts" ON public.post_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_likes.post_id 
            AND (
                posts.privacy = 'public' OR 
                posts.user_id = auth.uid()
            )
        )
    );

-- Users can like posts they can see
CREATE POLICY "Users can like visible posts" ON public.post_likes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_id 
            AND (
                posts.privacy = 'public' OR 
                posts.user_id = auth.uid()
            )
        )
    );

-- Users can unlike their own likes
CREATE POLICY "Users can remove their own likes" ON public.post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES FOR COMMENTS
-- ============================================================================

-- Users can view comments on posts they can see
CREATE POLICY "Users can view comments on visible posts" ON public.post_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_comments.post_id 
            AND (
                posts.privacy = 'public' OR 
                posts.user_id = auth.uid()
            )
        )
    );

-- Users can comment on posts they can see
CREATE POLICY "Users can comment on visible posts" ON public.post_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_id 
            AND (
                posts.privacy = 'public' OR 
                posts.user_id = auth.uid()
            )
        )
    );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON public.post_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON public.post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES FOR SHARES
-- ============================================================================

-- Users can view shares on posts they can see
CREATE POLICY "Users can view shares on visible posts" ON public.post_shares
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_shares.post_id 
            AND (
                posts.privacy = 'public' OR 
                posts.user_id = auth.uid()
            )
        )
    );

-- Users can share posts they can see
CREATE POLICY "Users can share visible posts" ON public.post_shares
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_id 
            AND (
                posts.privacy = 'public' OR 
                posts.user_id = auth.uid()
            )
        )
    );

-- Users can delete their own shares
CREATE POLICY "Users can delete own shares" ON public.post_shares
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES FOR COMMENT LIKES
-- ============================================================================

-- Users can view comment likes on comments they can see
CREATE POLICY "Users can view comment likes" ON public.comment_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.post_comments 
            JOIN public.posts ON posts.id = post_comments.post_id
            WHERE post_comments.id = comment_likes.comment_id 
            AND (
                posts.privacy = 'public' OR 
                posts.user_id = auth.uid()
            )
        )
    );

-- Users can like comments they can see
CREATE POLICY "Users can like comments" ON public.comment_likes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.post_comments 
            JOIN public.posts ON posts.id = post_comments.post_id
            WHERE post_comments.id = comment_id 
            AND (
                posts.privacy = 'public' OR 
                posts.user_id = auth.uid()
            )
        )
    );

-- Users can unlike comments
CREATE POLICY "Users can remove comment likes" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Posts indexes
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts (user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS posts_privacy_idx ON public.posts (privacy);
CREATE INDEX IF NOT EXISTS posts_type_idx ON public.posts (post_type);

-- Likes indexes
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON public.post_likes (post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON public.post_likes (user_id);

-- Comments indexes
CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON public.post_comments (post_id);
CREATE INDEX IF NOT EXISTS post_comments_user_id_idx ON public.post_comments (user_id);
CREATE INDEX IF NOT EXISTS post_comments_parent_idx ON public.post_comments (parent_comment_id);

-- Shares indexes
CREATE INDEX IF NOT EXISTS post_shares_post_id_idx ON public.post_shares (post_id);
CREATE INDEX IF NOT EXISTS post_shares_user_id_idx ON public.post_shares (user_id);

-- Comment likes indexes
CREATE INDEX IF NOT EXISTS comment_likes_comment_id_idx ON public.comment_likes (comment_id);
CREATE INDEX IF NOT EXISTS comment_likes_user_id_idx ON public.comment_likes (user_id);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
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
CREATE OR REPLACE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================================

-- View for posts with user info and interaction counts
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
SELECT 'Social feed database schema created successfully!' as result; 