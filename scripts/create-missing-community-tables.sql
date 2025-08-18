-- Create Missing Community Tables
-- This script checks what exists and creates only what's missing

-- Step 1: Check what community tables already exist
SELECT 
    'Existing community tables' as section,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%community%'
ORDER BY table_name;

-- Step 2: Create communities table if it doesn't exist
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

-- Step 3: Create community_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- Step 4: Create community_posts table if it doesn't exist
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

-- Step 5: Create post_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Step 6: Create post_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Enable Row Level Security on all tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Step 8: Create simple policies for communities table
DROP POLICY IF EXISTS "communities_select_policy" ON public.communities;
DROP POLICY IF EXISTS "communities_insert_policy" ON public.communities;
DROP POLICY IF EXISTS "communities_update_policy" ON public.communities;
DROP POLICY IF EXISTS "communities_delete_policy" ON public.communities;

CREATE POLICY "communities_select_policy" ON public.communities
    FOR SELECT USING (true);

CREATE POLICY "communities_insert_policy" ON public.communities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "communities_update_policy" ON public.communities
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "communities_delete_policy" ON public.communities
    FOR DELETE USING (created_by = auth.uid());

-- Step 9: Create simple policies for community_members table
DROP POLICY IF EXISTS "community_members_select_policy" ON public.community_members;
DROP POLICY IF EXISTS "community_members_insert_policy" ON public.community_members;
DROP POLICY IF EXISTS "community_members_delete_policy" ON public.community_members;

CREATE POLICY "community_members_select_policy" ON public.community_members
    FOR SELECT USING (true);

CREATE POLICY "community_members_insert_policy" ON public.community_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "community_members_delete_policy" ON public.community_members
    FOR DELETE USING (user_id = auth.uid());

-- Step 10: Create simple policies for community_posts table
DROP POLICY IF EXISTS "community_posts_select_policy" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_insert_policy" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_update_policy" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_delete_policy" ON public.community_posts;

CREATE POLICY "community_posts_select_policy" ON public.community_posts
    FOR SELECT USING (true);

CREATE POLICY "community_posts_insert_policy" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "community_posts_update_policy" ON public.community_posts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "community_posts_delete_policy" ON public.community_posts
    FOR DELETE USING (user_id = auth.uid());

-- Step 11: Create simple policies for post_likes table
DROP POLICY IF EXISTS "post_likes_select_policy" ON public.post_likes;
DROP POLICY IF EXISTS "post_likes_insert_policy" ON public.post_likes;
DROP POLICY IF EXISTS "post_likes_delete_policy" ON public.post_likes;

CREATE POLICY "post_likes_select_policy" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "post_likes_insert_policy" ON public.post_likes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "post_likes_delete_policy" ON public.post_likes
    FOR DELETE USING (user_id = auth.uid());

-- Step 12: Create simple policies for post_comments table
DROP POLICY IF EXISTS "post_comments_select_policy" ON public.post_comments;
DROP POLICY IF EXISTS "post_comments_insert_policy" ON public.post_comments;
DROP POLICY IF EXISTS "post_comments_update_policy" ON public.post_comments;
DROP POLICY IF EXISTS "post_comments_delete_policy" ON public.post_comments;

CREATE POLICY "post_comments_select_policy" ON public.post_comments
    FOR SELECT USING (true);

CREATE POLICY "post_comments_insert_policy" ON public.post_comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "post_comments_update_policy" ON public.post_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "post_comments_delete_policy" ON public.post_comments
    FOR DELETE USING (user_id = auth.uid());

-- Step 13: Insert sample community data if none exists
INSERT INTO public.communities (name, description, category, location, tags, created_by, member_count)
SELECT 
    'African Entrepreneurs Network',
    'Connect with fellow African entrepreneurs, share experiences, and collaborate on business opportunities across the continent.',
    'Business',
    'Pan-African',
    ARRAY['Entrepreneurship', 'Networking', 'Business', 'Collaboration'],
    auth.uid(),
    1
WHERE NOT EXISTS (SELECT 1 FROM public.communities WHERE name = 'African Entrepreneurs Network');

-- Step 14: Verification - show all created tables
SELECT 
    'All community tables created successfully!' as message,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%community%';

-- Step 15: Show table structure
SELECT 
    'Table structure' as section,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name LIKE '%community%'
ORDER BY table_name, ordinal_position;
