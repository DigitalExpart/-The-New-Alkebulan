-- Fix Community Posts Table Structure
-- This script ensures the community_posts table has the correct structure

-- Step 1: Drop existing community_posts table if it exists
DROP TABLE IF EXISTS public.community_posts CASCADE;

-- Step 2: Create community_posts table with correct structure
CREATE TABLE public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_community_id ON public.community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at);

-- Step 4: Enable Row Level Security
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist
DROP POLICY IF EXISTS "community_posts_select_policy" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_insert_policy" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_update_policy" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_delete_policy" ON public.community_posts;

-- Step 6: Create RLS policies
-- Allow anyone to view posts
CREATE POLICY "community_posts_select_policy" ON public.community_posts
    FOR SELECT USING (true);

-- Allow community members to create posts
CREATE POLICY "community_posts_insert_policy" ON public.community_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = community_posts.community_id 
            AND user_id = community_posts.user_id
        )
    );

-- Allow post creators to update their own posts
CREATE POLICY "community_posts_update_policy" ON public.community_posts
    FOR UPDATE USING (user_id = auth.uid());

-- Allow post creators and community admins to delete posts
CREATE POLICY "community_posts_delete_policy" ON public.community_posts
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = community_posts.community_id 
            AND user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Step 7: Create post_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Step 8: Enable RLS on post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Step 9: Create policies for post_likes
DROP POLICY IF EXISTS "post_likes_select_policy" ON public.post_likes;
DROP POLICY IF EXISTS "post_likes_insert_policy" ON public.post_likes;
DROP POLICY IF EXISTS "post_likes_delete_policy" ON public.post_likes;

CREATE POLICY "post_likes_select_policy" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "post_likes_insert_policy" ON public.post_likes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_members cm
            JOIN public.community_posts cp ON cm.community_id = cp.community_id
            WHERE cp.id = post_likes.post_id 
            AND cm.user_id = post_likes.user_id
        )
    );

CREATE POLICY "post_likes_delete_policy" ON public.post_likes
    FOR DELETE USING (user_id = auth.uid());

-- Step 10: Create post_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 11: Enable RLS on post_comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Step 12: Create policies for post_comments
DROP POLICY IF EXISTS "post_comments_select_policy" ON public.post_comments;
DROP POLICY IF EXISTS "post_comments_insert_policy" ON public.post_comments;
DROP POLICY IF EXISTS "post_comments_update_policy" ON public.post_comments;
DROP POLICY IF EXISTS "post_comments_delete_policy" ON public.post_comments;

CREATE POLICY "post_comments_select_policy" ON public.post_comments
    FOR SELECT USING (true);

CREATE POLICY "post_comments_insert_policy" ON public.post_comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_members cm
            JOIN public.community_posts cp ON cm.community_id = cp.community_id
            WHERE cp.id = post_comments.post_id 
            AND cm.user_id = post_comments.user_id
        )
    );

CREATE POLICY "post_comments_update_policy" ON public.post_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "post_comments_delete_policy" ON public.post_comments
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.community_members cm
            JOIN public.community_posts cp ON cm.community_id = cp.community_id
            WHERE cp.id = post_comments.post_id 
            AND cm.user_id = auth.uid() 
            AND cm.role IN ('admin', 'moderator')
        )
    );

-- Step 13: Verify the structure
SELECT 'Community posts table structure fixed successfully!' as result;
