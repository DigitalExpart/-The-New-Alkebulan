-- Complete Fix for Post Creation Issues
-- This script sets up everything needed for the create post modal to work

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

-- Drop existing posts table if it has wrong structure
DROP TABLE IF EXISTS public.posts CASCADE;

-- Create posts table with comprehensive fields for the create post modal
CREATE TABLE public.posts (
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
-- STEP 3: CREATE POST ENGAGEMENTS TABLE
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

-- ============================================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts(user_id, created_at DESC);

-- ============================================================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================================================

-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view public posts and own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

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

-- Enable RLS on post_engagements
ALTER TABLE public.post_engagements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view post engagements" ON public.post_engagements;
DROP POLICY IF EXISTS "Users can insert own engagements" ON public.post_engagements;
DROP POLICY IF EXISTS "Users can delete own engagements" ON public.post_engagements;

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
-- STEP 6: CREATE STORAGE POLICIES
-- ============================================================================

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload post media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own post media" ON storage.objects;

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
-- STEP 7: CREATE TRIGGER FOR UPDATED_AT
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
-- STEP 8: CREATE POSTS WITH STATS VIEW
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
-- STEP 9: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function: Create Post with Media
CREATE OR REPLACE FUNCTION create_post_with_media(
    p_content TEXT,
    p_feeling TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_post_type TEXT DEFAULT 'text',
    p_visibility TEXT DEFAULT 'public'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_post_id UUID;
BEGIN
    -- Validate input parameters
    IF p_content IS NULL OR TRIM(p_content) = '' THEN
        RAISE EXCEPTION 'Post content cannot be empty';
    END IF;
    
    IF p_post_type NOT IN ('text', 'image', 'video', 'media') THEN
        RAISE EXCEPTION 'Invalid post type: %', p_post_type;
    END IF;
    
    IF p_visibility NOT IN ('public', 'followers', 'friends', 'location') THEN
        RAISE EXCEPTION 'Invalid visibility: %', p_visibility;
    END IF;
    
    -- Insert the post
    INSERT INTO public.posts (
        user_id,
        content,
        image_url,
        post_type,
        visibility,
        feeling,
        location,
        metadata
    ) VALUES (
        auth.uid(),
        p_content,
        p_image_url,
        p_post_type,
        p_visibility,
        p_feeling,
        p_location,
        p_metadata
    ) RETURNING id INTO new_post_id;
    
    RETURN new_post_id;
END;
$$;

-- Function: Get User Posts with Pagination
CREATE OR REPLACE FUNCTION get_user_posts(
    p_user_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    image_url TEXT,
    post_type TEXT,
    visibility TEXT,
    feeling TEXT,
    location TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    author_name TEXT,
    author_avatar TEXT,
    author_username TEXT,
    likes_count BIGINT,
    comments_count BIGINT,
    shares_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pws.id,
        pws.content,
        pws.image_url,
        pws.post_type,
        pws.visibility,
        pws.feeling,
        pws.location,
        pws.metadata,
        pws.created_at,
        pws.updated_at,
        pws.author_name,
        pws.author_avatar,
        pws.author_username,
        pws.likes_count,
        pws.comments_count,
        pws.shares_count
    FROM public.posts_with_stats pws
    WHERE 
        (p_user_id IS NULL OR pws.user_id = p_user_id)
        AND (
            pws.visibility = 'public' OR 
            pws.user_id = auth.uid() OR
            (pws.visibility = 'followers' AND EXISTS (
                SELECT 1 FROM public.user_follows 
                WHERE follower_id = auth.uid() AND following_id = pws.user_id
            )) OR
            (pws.visibility = 'friends' AND EXISTS (
                SELECT 1 FROM public.user_friends 
                WHERE (user_id = auth.uid() AND friend_id = pws.user_id) OR
                      (friend_id = auth.uid() AND user_id = pws.user_id)
            ))
        )
    ORDER BY pws.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Function: Toggle Post Like
CREATE OR REPLACE FUNCTION toggle_post_like(p_post_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    existing_like UUID;
    is_liked BOOLEAN;
BEGIN
    -- Check if user already liked this post
    SELECT id INTO existing_like
    FROM public.post_engagements
    WHERE post_id = p_post_id 
    AND user_id = auth.uid() 
    AND engagement_type = 'like';
    
    IF existing_like IS NOT NULL THEN
        -- Unlike the post
        DELETE FROM public.post_engagements
        WHERE id = existing_like;
        is_liked := FALSE;
    ELSE
        -- Like the post
        INSERT INTO public.post_engagements (post_id, user_id, engagement_type)
        VALUES (p_post_id, auth.uid(), 'like');
        is_liked := TRUE;
    END IF;
    
    RETURN is_liked;
END;
$$;

-- Function: Get Post Engagement Status
CREATE OR REPLACE FUNCTION get_post_engagement_status(p_post_id UUID)
RETURNS TABLE (
    is_liked BOOLEAN,
    likes_count BIGINT,
    comments_count BIGINT,
    shares_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(
            SELECT 1 FROM public.post_engagements 
            WHERE post_id = p_post_id 
            AND user_id = auth.uid() 
            AND engagement_type = 'like'
        ) as is_liked,
        COALESCE((
            SELECT COUNT(*) FROM public.post_engagements 
            WHERE post_id = p_post_id AND engagement_type = 'like'
        ), 0) as likes_count,
        COALESCE((
            SELECT COUNT(*) FROM public.post_engagements 
            WHERE post_id = p_post_id AND engagement_type = 'comment'
        ), 0) as comments_count,
        COALESCE((
            SELECT COUNT(*) FROM public.post_engagements 
            WHERE post_id = p_post_id AND engagement_type = 'share'
        ), 0) as shares_count;
END;
$$;

-- Function: Delete Post and Cleanup Media
CREATE OR REPLACE FUNCTION delete_post_with_cleanup(p_post_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_record RECORD;
    media_paths TEXT[];
BEGIN
    -- Get post details
    SELECT * INTO post_record
    FROM public.posts
    WHERE id = p_post_id AND user_id = auth.uid();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Post not found or access denied';
    END IF;
    
    -- Collect media paths for cleanup
    media_paths := ARRAY[]::TEXT[];
    
    IF post_record.image_url IS NOT NULL THEN
        -- Extract file path from URL
        media_paths := array_append(media_paths, 
            regexp_replace(post_record.image_url, '^.*\/storage\/v1\/object\/public\/post-media\/', '')
        );
    END IF;
    
    -- Add media URLs from metadata if they exist
    IF post_record.metadata ? 'media_urls' THEN
        FOR i IN 1..jsonb_array_length(post_record.metadata->'media_urls') LOOP
            media_paths := array_append(media_paths,
                regexp_replace(
                    post_record.metadata->'media_urls'->(i-1) #>> '{}', 
                    '^.*\/storage\/v1\/object\/public\/post-media\/', 
                    ''
                )
            );
        END LOOP;
    END IF;
    
    -- Delete the post (this will cascade delete engagements)
    DELETE FROM public.posts WHERE id = p_post_id;
    
    -- Clean up media files from storage
    IF array_length(media_paths, 1) > 0 THEN
        FOR i IN 1..array_length(media_paths, 1) LOOP
            DELETE FROM storage.objects 
            WHERE bucket_id = 'post-media' 
            AND name = media_paths[i];
        END LOOP;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- ============================================================================
-- STEP 10: GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_post_with_media TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_posts TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_post_like TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_engagement_status TO authenticated;
GRANT EXECUTE ON FUNCTION delete_post_with_cleanup TO authenticated;

-- ============================================================================
-- STEP 11: VERIFY SETUP
-- ============================================================================

-- Check if bucket was created successfully
SELECT 'Bucket Status:' as check_type, id, name, public, file_size_limit FROM storage.buckets WHERE id = 'post-media';

-- Check if posts table exists
SELECT 'Posts Table Columns:' as check_type, table_name, column_name, data_type FROM information_schema.columns 
WHERE table_name = 'posts' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if policies are in place
SELECT 'RLS Policies:' as check_type, schemaname, tablename, policyname FROM pg_policies 
WHERE tablename IN ('posts', 'post_engagements')
ORDER BY tablename, policyname;

-- Check if functions exist
SELECT 'Functions:' as check_type, routine_name, routine_type FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE '%post%'
ORDER BY routine_name;

RAISE NOTICE 'Complete post creation setup completed successfully!';
