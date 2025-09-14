-- Helper Functions for Post Creation
-- Run this script in your Supabase SQL Editor after running the main setup script

-- ============================================================================
-- FUNCTION: Create Post with Media
-- ============================================================================

CREATE OR REPLACE FUNCTION create_post_with_media(
    p_content TEXT,
    p_image_url TEXT DEFAULT NULL,
    p_post_type TEXT DEFAULT 'text',
    p_visibility TEXT DEFAULT 'public',
    p_feeling TEXT DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
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

-- ============================================================================
-- FUNCTION: Get User Posts with Pagination
-- ============================================================================

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

-- ============================================================================
-- FUNCTION: Toggle Post Like
-- ============================================================================

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

-- ============================================================================
-- FUNCTION: Get Post Engagement Status
-- ============================================================================

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

-- ============================================================================
-- FUNCTION: Delete Post and Cleanup Media
-- ============================================================================

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
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_post_with_media TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_posts TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_post_like TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_engagement_status TO authenticated;
GRANT EXECUTE ON FUNCTION delete_post_with_cleanup TO authenticated;

RAISE NOTICE 'Post helper functions created successfully!';
