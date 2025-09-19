-- Create User Media Table Schema
-- This script creates a dedicated table for user media files separate from posts

-- Create user_media table for storing user's media files
CREATE TABLE IF NOT EXISTS public.user_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    width INTEGER, -- For images/videos
    height INTEGER, -- For images/videos
    duration INTEGER, -- For videos (in seconds)
    thumbnail_url TEXT, -- For videos
    alt_text TEXT, -- For accessibility
    description TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_media_user_id ON public.user_media(user_id);
CREATE INDEX IF NOT EXISTS idx_user_media_file_type ON public.user_media(file_type);
CREATE INDEX IF NOT EXISTS idx_user_media_is_public ON public.user_media(is_public);
CREATE INDEX IF NOT EXISTS idx_user_media_created_at ON public.user_media(created_at);
CREATE INDEX IF NOT EXISTS idx_user_media_tags ON public.user_media USING GIN(tags);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_user_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_media_updated_at
    BEFORE UPDATE ON public.user_media
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_media_updated_at();

-- Enable Row Level Security
ALTER TABLE public.user_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own media and public media
CREATE POLICY "Users can view their own media and public media" ON public.user_media
    FOR SELECT USING (
        user_id = auth.uid() OR is_public = true
    );

-- Users can insert their own media
CREATE POLICY "Users can insert their own media" ON public.user_media
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own media
CREATE POLICY "Users can update their own media" ON public.user_media
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own media
CREATE POLICY "Users can delete their own media" ON public.user_media
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_media TO authenticated;

-- Create a view for media with user information
CREATE OR REPLACE VIEW public.user_media_with_profile AS
SELECT 
    um.id,
    um.user_id,
    um.filename,
    um.original_filename,
    um.file_url,
    um.file_type,
    um.mime_type,
    um.file_size,
    um.width,
    um.height,
    um.duration,
    um.thumbnail_url,
    um.alt_text,
    um.description,
    um.tags,
    um.is_public,
    um.created_at,
    um.updated_at,
    p.first_name,
    p.last_name,
    p.username,
    p.avatar_url
FROM public.user_media um
LEFT JOIN public.profiles p ON um.user_id = p.id;

-- RLS for the view
ALTER VIEW public.user_media_with_profile SET (security_invoker = true);

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_user_media_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.user_media
        WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_media_by_type(user_uuid UUID, media_type VARCHAR)
RETURNS TABLE (
    id UUID,
    filename TEXT,
    file_url TEXT,
    file_type VARCHAR,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        um.id,
        um.filename,
        um.file_url,
        um.file_type,
        um.file_size,
        um.created_at
    FROM public.user_media um
    WHERE um.user_id = user_uuid 
    AND um.file_type = media_type
    ORDER BY um.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_media_stats(user_uuid UUID)
RETURNS TABLE (
    total_files INTEGER,
    total_size BIGINT,
    image_count INTEGER,
    video_count INTEGER,
    document_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_files,
        COALESCE(SUM(file_size), 0) as total_size,
        COUNT(CASE WHEN file_type = 'image' THEN 1 END)::INTEGER as image_count,
        COUNT(CASE WHEN file_type = 'video' THEN 1 END)::INTEGER as video_count,
        COUNT(CASE WHEN file_type = 'document' THEN 1 END)::INTEGER as document_count
    FROM public.user_media
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.get_user_media_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_media_by_type(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_media_stats(UUID) TO authenticated;

-- Create a function to clean up orphaned media files
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_media()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete media files that are not referenced in any posts
    DELETE FROM public.user_media 
    WHERE id NOT IN (
        SELECT DISTINCT unnest(
            CASE 
                WHEN metadata ? 'media_urls' 
                THEN (metadata->>'media_urls')::jsonb 
                ELSE '[]'::jsonb 
            END
        )::text
        FROM public.posts 
        WHERE metadata ? 'media_urls'
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission for cleanup function (admin only)
GRANT EXECUTE ON FUNCTION public.cleanup_orphaned_media() TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.user_media IS 'Dedicated table for user media files (images, videos, documents)';
COMMENT ON COLUMN public.user_media.file_type IS 'Type of media: image, video, or document';
COMMENT ON COLUMN public.user_media.width IS 'Width in pixels (for images/videos)';
COMMENT ON COLUMN public.user_media.height IS 'Height in pixels (for images/videos)';
COMMENT ON COLUMN public.user_media.duration IS 'Duration in seconds (for videos)';
COMMENT ON COLUMN public.user_media.thumbnail_url IS 'Thumbnail URL for videos';
COMMENT ON COLUMN public.user_media.alt_text IS 'Alternative text for accessibility';
COMMENT ON COLUMN public.user_media.tags IS 'Array of tags for categorization';
COMMENT ON VIEW public.user_media_with_profile IS 'User media with profile information for display';
COMMENT ON FUNCTION public.get_user_media_count(UUID) IS 'Get total media count for a user';
COMMENT ON FUNCTION public.get_user_media_by_type(UUID, VARCHAR) IS 'Get user media filtered by type';
COMMENT ON FUNCTION public.get_user_media_stats(UUID) IS 'Get comprehensive media statistics for a user';
COMMENT ON FUNCTION public.cleanup_orphaned_media() IS 'Clean up media files not referenced in posts';
