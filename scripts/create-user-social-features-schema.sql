-- Create User Social Features Schema
-- This script creates tables for followers, following, post visibility, and engagement tracking

-- 1. Create user_follows table for follower/following relationships
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique follower-following pairs
    UNIQUE(follower_id, following_id),
    
    -- Prevent self-following
    CHECK (follower_id != following_id)
);

-- 2. Create user_friends table for friend relationships
CREATE TABLE IF NOT EXISTS public.user_friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique user-friend pairs
    UNIQUE(user_id, friend_id),
    
    -- Prevent self-friending
    CHECK (user_id != friend_id)
);

-- 3. Create user_posts table for user-specific posts (separate from community posts)
CREATE TABLE IF NOT EXISTS public.user_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    visibility VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'friends', 'location')),
    location_data JSONB, -- Store location info for location-based visibility
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure content is not empty
    CHECK (LENGTH(TRIM(content)) > 0)
);

-- 4. Create post_engagements table for tracking likes, comments, shares
CREATE TABLE IF NOT EXISTS public.post_engagements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.user_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    engagement_type VARCHAR(20) NOT NULL CHECK (engagement_type IN ('like', 'comment', 'share', 'view')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique user-post-engagement combinations
    UNIQUE(post_id, user_id, engagement_type)
);

-- 5. Create post_comments table for post comments
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.user_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE, -- For replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure content is not empty
    CHECK (LENGTH(TRIM(content)) > 0)
);

-- 6. Create user_locations table for location-based visibility
CREATE TABLE IF NOT EXISTS public.user_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location_name TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    radius_km INTEGER DEFAULT 10, -- Default radius for location-based visibility
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure valid coordinates
    CHECK (latitude >= -90 AND latitude <= 90),
    CHECK (longitude >= -180 AND longitude <= 180),
    CHECK (radius_km > 0 AND radius_km <= 1000)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON public.user_follows(created_at);

CREATE INDEX IF NOT EXISTS idx_user_friends_user_id ON public.user_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_friend_id ON public.user_friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_status ON public.user_friends(status);

CREATE INDEX IF NOT EXISTS idx_user_posts_user_id ON public.user_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_posts_visibility ON public.user_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_user_posts_created_at ON public.user_posts(created_at);

CREATE INDEX IF NOT EXISTS idx_post_engagements_post_id ON public.post_engagements(post_id);
CREATE INDEX IF NOT EXISTS idx_post_engagements_user_id ON public.post_engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_post_engagements_type ON public.post_engagements(engagement_type);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON public.user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_coordinates ON public.user_locations(latitude, longitude);

-- Enable Row Level Security
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_follows
CREATE POLICY "Users can view all follows" ON public.user_follows
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own follows" ON public.user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON public.user_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for user_friends
CREATE POLICY "Users can view their own friendships" ON public.user_friends
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create their own friend requests" ON public.user_friends
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendships" ON public.user_friends
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friendships" ON public.user_friends
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for user_posts
CREATE POLICY "Users can view posts based on visibility" ON public.user_posts
    FOR SELECT USING (
        visibility = 'public' OR
        (visibility = 'followers' AND EXISTS (
            SELECT 1 FROM public.user_follows 
            WHERE follower_id = auth.uid() AND following_id = user_posts.user_id
        )) OR
        (visibility = 'friends' AND EXISTS (
            SELECT 1 FROM public.user_friends 
            WHERE ((user_id = auth.uid() AND friend_id = user_posts.user_id) OR 
                   (user_id = user_posts.user_id AND friend_id = auth.uid())) 
            AND status = 'accepted'
        )) OR
        user_id = auth.uid()
    );

CREATE POLICY "Users can create their own posts" ON public.user_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.user_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.user_posts
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_engagements
CREATE POLICY "Users can view all engagements" ON public.post_engagements
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own engagements" ON public.post_engagements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own engagements" ON public.post_engagements
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_comments
CREATE POLICY "Users can view comments on visible posts" ON public.post_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_posts 
            WHERE id = post_comments.post_id 
            AND (
                visibility = 'public' OR
                (visibility = 'followers' AND EXISTS (
                    SELECT 1 FROM public.user_follows 
                    WHERE follower_id = auth.uid() AND following_id = user_posts.user_id
                )) OR
                (visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM public.user_friends 
                    WHERE ((user_id = auth.uid() AND friend_id = user_posts.user_id) OR 
                           (user_id = user_posts.user_id AND friend_id = auth.uid())) 
                    AND status = 'accepted'
                )) OR
                user_posts.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create comments on visible posts" ON public.post_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.user_posts 
            WHERE id = post_comments.post_id 
            AND (
                visibility = 'public' OR
                (visibility = 'followers' AND EXISTS (
                    SELECT 1 FROM public.user_follows 
                    WHERE follower_id = auth.uid() AND following_id = user_posts.user_id
                )) OR
                (visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM public.user_friends 
                    WHERE ((user_id = auth.uid() AND friend_id = user_posts.user_id) OR 
                           (user_id = user_posts.user_id AND friend_id = auth.uid())) 
                    AND status = 'accepted'
                )) OR
                user_posts.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own comments" ON public.post_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_locations
CREATE POLICY "Users can view their own locations" ON public.user_locations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own locations" ON public.user_locations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations" ON public.user_locations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations" ON public.user_locations
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_follows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_friends TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_engagements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_locations TO authenticated;

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_user_followers_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.user_follows
        WHERE following_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_following_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.user_follows
        WHERE follower_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_posts_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.user_posts
        WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.get_user_followers_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_following_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_posts_count(UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.user_follows IS 'Follower/following relationships between users';
COMMENT ON TABLE public.user_friends IS 'Friend relationships with status tracking';
COMMENT ON TABLE public.user_posts IS 'User-specific posts with visibility controls';
COMMENT ON TABLE public.post_engagements IS 'Post engagement tracking (likes, comments, shares, views)';
COMMENT ON TABLE public.post_comments IS 'Comments on user posts with reply support';
COMMENT ON TABLE public.user_locations IS 'User location data for location-based visibility';
