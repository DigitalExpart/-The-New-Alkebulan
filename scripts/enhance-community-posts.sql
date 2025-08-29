-- Enhance Community Posts with Media, Location, and Feels
-- This script adds new columns to support rich media posts

-- Step 1: Add new columns to community_posts table
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'video', 'mixed')),
ADD COLUMN IF NOT EXISTS location_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS location_coordinates POINT,
ADD COLUMN IF NOT EXISTS feels_emoji VARCHAR(10),
ADD COLUMN IF NOT EXISTS feels_description VARCHAR(100),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'; -- New column for storing post metadata like hashtags

-- Step 2: Create media_uploads table for better media management
CREATE TABLE IF NOT EXISTS public.media_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    thumbnail_url TEXT,
    duration INTEGER, -- for videos in seconds
    width INTEGER, -- for images/videos
    height INTEGER, -- for images/videos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create post_feels table for emoji reactions
CREATE TABLE IF NOT EXISTS public.post_feels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    description VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_uploads_post_id ON public.media_uploads(post_id);
CREATE INDEX IF NOT EXISTS idx_media_uploads_user_id ON public.media_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_post_feels_post_id ON public.post_feels(post_id);
CREATE INDEX IF NOT EXISTS idx_post_feels_user_id ON public.post_feels(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_media_type ON public.community_posts(media_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_location ON public.community_posts USING GIST(location_coordinates);

-- Step 5: Enable RLS on new tables
ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_feels ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for media_uploads
DROP POLICY IF EXISTS "media_uploads_select_policy" ON public.media_uploads;
DROP POLICY IF EXISTS "media_uploads_insert_policy" ON public.media_uploads;
DROP POLICY IF EXISTS "media_uploads_delete_policy" ON public.media_uploads;

CREATE POLICY "media_uploads_select_policy" ON public.media_uploads
    FOR SELECT USING (true);

CREATE POLICY "media_uploads_insert_policy" ON public.media_uploads
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_posts cp
            JOIN public.community_members cm ON cp.community_id = cm.community_id
            WHERE cp.id = media_uploads.post_id 
            AND cm.user_id = media_uploads.user_id
        )
    );

CREATE POLICY "media_uploads_delete_policy" ON public.media_uploads
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.community_posts cp
            JOIN public.community_members cm ON cp.community_id = cm.community_id
            WHERE cp.id = media_uploads.post_id 
            AND cm.user_id = auth.uid() 
            AND cm.role IN ('admin', 'moderator')
        )
    );

-- Step 7: Create RLS policies for post_feels
DROP POLICY IF EXISTS "post_feels_select_policy" ON public.post_feels;
DROP POLICY IF EXISTS "post_feels_insert_policy" ON public.post_feels;
DROP POLICY IF EXISTS "post_feels_update_policy" ON public.post_feels;
DROP POLICY IF EXISTS "post_feels_delete_policy" ON public.post_feels;

CREATE POLICY "post_feels_select_policy" ON public.post_feels
    FOR SELECT USING (true);

CREATE POLICY "post_feels_insert_policy" ON public.post_feels
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_posts cp
            JOIN public.community_members cm ON cp.community_id = cm.community_id
            WHERE cp.id = post_feels.post_id 
            AND cm.user_id = post_feels.user_id
        )
    );

CREATE POLICY "post_feels_update_policy" ON public.post_feels
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "post_feels_delete_policy" ON public.post_feels
    FOR DELETE USING (user_id = auth.uid());

-- Step 8: Create function to update post media_type based on media_urls
CREATE OR REPLACE FUNCTION update_post_media_type()
RETURNS TRIGGER AS $$
BEGIN
    -- Update media_type based on media_urls content
    IF NEW.media_urls IS NULL OR array_length(NEW.media_urls, 1) = 0 THEN
        NEW.media_type := 'text';
    ELSIF array_length(NEW.media_urls, 1) = 1 THEN
        -- Check if it's image or video based on file extension
        IF NEW.media_urls[1] ~* '\.(jpg|jpeg|png|gif|webp)$' THEN
            NEW.media_type := 'image';
        ELSIF NEW.media_urls[1] ~* '\.(mp4|avi|mov|wmv|flv|webm)$' THEN
            NEW.media_type := 'video';
        ELSE
            NEW.media_type := 'text';
        END IF;
    ELSE
        NEW.media_type := 'mixed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger to automatically update media_type
DROP TRIGGER IF EXISTS trigger_update_post_media_type ON public.community_posts;
CREATE TRIGGER trigger_update_post_media_type
    BEFORE INSERT OR UPDATE ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_post_media_type();

-- Step 10: Verify the enhanced structure
SELECT 'Community posts enhanced with media, location, and feels support!' as result;
