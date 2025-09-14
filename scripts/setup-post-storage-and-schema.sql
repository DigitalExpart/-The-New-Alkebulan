-- Setup Post Storage and Schema for Create Post Modal
-- Run this script in your Supabase SQL Editor

-- ============================================================================
-- STEP 1: CREATE STORAGE BUCKET FOR POSTS
-- ============================================================================

-- Create the post-media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-media',
  'post-media',
  true,
  524288000, -- 500MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mov',
    'video/avi',
    'video/mkv',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- STEP 2: CREATE POSTS TABLE (if not exists)
-- ============================================================================

-- Create posts table with comprehensive fields for the create post modal
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    post_type TEXT NOT NULL DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'media')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'friends', 'location')),
    feeling TEXT,
    location TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts(user_id, created_at DESC);

-- ============================================================================
-- STEP 4: CREATE RLS POLICIES
-- ============================================================================

-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view public posts and their own posts
CREATE POLICY "Users can view public posts and own posts" ON public.posts
    FOR SELECT USING (
        visibility = 'public' OR 
        user_id = auth.uid() OR
        (visibility = 'followers' AND EXISTS (
            SELECT 1 FROM public.user_follows 
            WHERE follower_id = auth.uid() AND following_id = user_id
        )) OR
        (visibility = 'friends' AND EXISTS (
            SELECT 1 FROM public.user_friends 
            WHERE (user_id = auth.uid() AND friend_id = posts.user_id) OR
                  (friend_id = auth.uid() AND user_id = posts.user_id)
        ))
    );

-- Policy: Users can insert their own posts
CREATE POLICY "Users can insert own posts" ON public.posts
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own posts
CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (user_id = auth.uid());

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON public.posts
    FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- STEP 5: CREATE STORAGE POLICIES
-- ============================================================================

-- Policy: Authenticated users can upload to post-media bucket
CREATE POLICY "Authenticated users can upload post media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'post-media' AND 
        auth.role() = 'authenticated'
    );

-- Policy: Anyone can view post media (public bucket)
CREATE POLICY "Anyone can view post media" ON storage.objects
    FOR SELECT USING (bucket_id = 'post-media');

-- Policy: Users can update their own post media
CREATE POLICY "Users can update own post media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'post-media' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can delete their own post media
CREATE POLICY "Users can delete own post media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'post-media' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- STEP 6: CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for posts table
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 7: CREATE POSTS WITH STATS VIEW
-- ============================================================================

-- Create a view that includes post statistics and author information
CREATE OR REPLACE VIEW public.posts_with_stats AS
SELECT 
    p.*,
    prof.first_name || ' ' || prof.last_name as author_name,
    prof.avatar_url as author_avatar,
    prof.username as author_username,
    COALESCE(pe.likes_count, 0) as likes_count,
    COALESCE(pe.comments_count, 0) as comments_count,
    COALESCE(pe.shares_count, 0) as shares_count
FROM public.posts p
LEFT JOIN public.profiles prof ON p.user_id = prof.user_id
LEFT JOIN (
    SELECT 
        post_id,
        COUNT(CASE WHEN engagement_type = 'like' THEN 1 END) as likes_count,
        COUNT(CASE WHEN engagement_type = 'comment' THEN 1 END) as comments_count,
        COUNT(CASE WHEN engagement_type = 'share' THEN 1 END) as shares_count
    FROM public.post_engagements
    GROUP BY post_id
) pe ON p.id = pe.post_id;

-- ============================================================================
-- STEP 8: CREATE POST ENGAGEMENTS TABLE
-- ============================================================================

-- Create post engagements table for likes, comments, shares
CREATE TABLE IF NOT EXISTS public.post_engagements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    engagement_type TEXT NOT NULL CHECK (engagement_type IN ('like', 'comment', 'share')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, engagement_type)
);

-- Enable RLS on post_engagements
ALTER TABLE public.post_engagements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all engagements
CREATE POLICY "Users can view post engagements" ON public.post_engagements
    FOR SELECT USING (true);

-- Policy: Users can insert their own engagements
CREATE POLICY "Users can insert own engagements" ON public.post_engagements
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own engagements
CREATE POLICY "Users can delete own engagements" ON public.post_engagements
    FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- STEP 9: VERIFY SETUP
-- ============================================================================

-- Check if bucket was created successfully
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'post-media';

-- Check if posts table exists
SELECT table_name, column_name, data_type FROM information_schema.columns 
WHERE table_name = 'posts' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if policies are in place
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE tablename IN ('posts', 'post_engagements')
ORDER BY tablename, policyname;

RAISE NOTICE 'Post storage and schema setup completed successfully!';
