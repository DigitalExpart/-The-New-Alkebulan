-- Create Community Tables for The New Alkebulan
-- This script sets up the database structure for communities, posts, likes, and comments

-- Step 1: Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    is_public BOOLEAN DEFAULT true,
    max_members INTEGER DEFAULT 1000,
    rules TEXT,
    contact_email VARCHAR(255),
    website VARCHAR(255),
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create community_members table
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- Step 3: Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Step 5: Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_communities_category ON public.communities(category);
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON public.communities(created_by);
CREATE INDEX IF NOT EXISTS idx_communities_status ON public.communities(status);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_community_id ON public.community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);

-- Step 7: Enable Row Level Security (RLS)
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for communities
CREATE POLICY "Communities are viewable by everyone" ON public.communities
    FOR SELECT USING (is_public = true OR EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = communities.id AND user_id = auth.uid()
    ));

CREATE POLICY "Users can create communities" ON public.communities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Community creators can update their communities" ON public.communities
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Community creators can delete their communities" ON public.communities
    FOR DELETE USING (created_by = auth.uid());

-- Step 9: Create RLS policies for community_members
CREATE POLICY "Members can view community members" ON public.community_members
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = community_members.community_id AND user_id = auth.uid()
    ));

CREATE POLICY "Users can join communities" ON public.community_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can leave communities" ON public.community_members
    FOR DELETE USING (user_id = auth.uid());

-- Step 10: Create RLS policies for community_posts
CREATE POLICY "Posts are viewable by community members" ON public.community_posts
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = community_posts.community_id AND user_id = auth.uid()
    ));

CREATE POLICY "Community members can create posts" ON public.community_posts
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = community_posts.community_id AND user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own posts" ON public.community_posts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON public.community_posts
    FOR DELETE USING (user_id = auth.uid());

-- Step 11: Create RLS policies for post_likes
CREATE POLICY "Likes are viewable by community members" ON public.post_likes
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.community_posts cp
        JOIN public.community_members cm ON cp.community_id = cm.community_id
        WHERE cp.id = post_likes.post_id AND cm.user_id = auth.uid()
    ));

CREATE POLICY "Community members can like posts" ON public.post_likes
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.community_posts cp
        JOIN public.community_members cm ON cp.community_id = cm.community_id
        WHERE cp.id = post_likes.post_id AND cm.user_id = auth.uid()
    ));

CREATE POLICY "Users can unlike their own likes" ON public.post_likes
    FOR DELETE USING (user_id = auth.uid());

-- Step 12: Create RLS policies for post_comments
CREATE POLICY "Comments are viewable by community members" ON public.post_comments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.community_posts cp
        JOIN public.community_members cm ON cp.community_id = cm.community_id
        WHERE cp.id = post_comments.post_id AND cm.user_id = auth.uid()
    ));

CREATE POLICY "Community members can create comments" ON public.post_comments
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.community_posts cp
        JOIN public.community_members cm ON cp.community_id = cm.community_id
        WHERE cp.id = post_comments.post_id AND cm.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own comments" ON public.post_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON public.post_comments
    FOR DELETE USING (user_id = auth.uid());

-- Step 13: Create functions to update counts automatically
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.communities 
        SET member_count = member_count + 1 
        WHERE id = NEW.community_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.communities 
        SET member_count = member_count - 1 
        WHERE id = OLD.community_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts 
        SET comments_count = comments_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 14: Create triggers to automatically update counts
CREATE TRIGGER trigger_update_community_member_count
    AFTER INSERT OR DELETE ON public.community_members
    FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

CREATE TRIGGER trigger_update_post_like_count
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

CREATE TRIGGER trigger_update_post_comment_count
    AFTER INSERT OR DELETE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Step 15: Insert sample data for testing
INSERT INTO public.communities (name, description, category, location, tags, created_by, member_count)
VALUES 
    ('African Entrepreneurs Network', 'Connect with fellow African entrepreneurs, share experiences, and collaborate on business opportunities across the continent.', 'Business', 'Pan-African', ARRAY['Entrepreneurship', 'Networking', 'Business', 'Collaboration'], auth.uid(), 1),
    ('Tech Innovators Hub', 'A community for tech enthusiasts, developers, and innovators to share knowledge, collaborate on projects, and stay updated with the latest trends.', 'Technology', 'Global', ARRAY['Technology', 'Innovation', 'Development', 'Learning'], auth.uid(), 1),
    ('Creative Arts Collective', 'Join artists, designers, and creative professionals to showcase work, find inspiration, and collaborate on creative projects.', 'Arts & Culture', 'Lagos, Nigeria', ARRAY['Arts', 'Design', 'Creativity', 'Inspiration'], auth.uid(), 1)
ON CONFLICT DO NOTHING;

-- Step 16: Verification
SELECT 
    'Community tables created successfully!' as message,
    COUNT(*) as communities_count,
    (SELECT COUNT(*) FROM public.community_members) as members_count,
    (SELECT COUNT(*) FROM public.community_posts) as posts_count
FROM public.communities;
