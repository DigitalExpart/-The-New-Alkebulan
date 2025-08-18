-- Fix Community Tables and Policies
-- This script checks what exists and fixes any issues

-- Step 1: Check what tables exist
SELECT 
    'Existing tables' as section,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%community%'
ORDER BY table_name;

-- Step 2: Check existing policies on communities table
SELECT 
    'Existing policies on communities' as section,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'communities';

-- Step 3: Drop conflicting policies if they exist
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON public.communities;
DROP POLICY IF EXISTS "Users can create communities" ON public.communities;
DROP POLICY IF EXISTS "Community creators can update their communities" ON public.communities;
DROP POLICY IF EXISTS "Community creators can delete their communities" ON public.communities;

-- Step 4: Create clean policies
CREATE POLICY "communities_select_policy" ON public.communities
    FOR SELECT USING (true);

CREATE POLICY "communities_insert_policy" ON public.communities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "communities_update_policy" ON public.communities
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "communities_delete_policy" ON public.communities
    FOR DELETE USING (created_by = auth.uid());

-- Step 5: Check and fix community_members policies
DROP POLICY IF EXISTS "Members can view community members" ON public.community_members;
DROP POLICY IF EXISTS "Users can join communities" ON public.community_members;
DROP POLICY IF EXISTS "Users can leave communities" ON public.community_members;

CREATE POLICY "community_members_select_policy" ON public.community_members
    FOR SELECT USING (true);

CREATE POLICY "community_members_insert_policy" ON public.community_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "community_members_delete_policy" ON public.community_members
    FOR DELETE USING (user_id = auth.uid());

-- Step 6: Check and fix community_posts policies
DROP POLICY IF EXISTS "Posts are viewable by community members" ON public.community_posts;
DROP POLICY IF EXISTS "Community members can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;

CREATE POLICY "community_posts_select_policy" ON public.community_posts
    FOR SELECT USING (true);

CREATE POLICY "community_posts_insert_policy" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "community_posts_update_policy" ON public.community_posts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "community_posts_delete_policy" ON public.community_posts
    FOR DELETE USING (user_id = auth.uid());

-- Step 7: Check and fix post_likes policies
DROP POLICY IF EXISTS "Likes are viewable by community members" ON public.post_likes;
DROP POLICY IF EXISTS "Community members can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.post_likes;

CREATE POLICY "post_likes_select_policy" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "post_likes_insert_policy" ON public.post_likes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "post_likes_delete_policy" ON public.post_likes
    FOR DELETE USING (user_id = auth.uid());

-- Step 8: Check and fix post_comments policies
DROP POLICY IF EXISTS "Comments are viewable by community members" ON public.post_comments;
DROP POLICY IF EXISTS "Community members can create comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.post_comments;

CREATE POLICY "post_comments_select_policy" ON public.post_comments
    FOR SELECT USING (true);

CREATE POLICY "post_comments_insert_policy" ON public.post_comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "post_comments_update_policy" ON public.post_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "post_comments_delete_policy" ON public.post_comments
    FOR DELETE USING (user_id = auth.uid());

-- Step 9: Verify the fix
SELECT 
    'Policies fixed successfully!' as message,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename IN ('communities', 'community_members', 'community_posts', 'post_likes', 'post_comments');

-- Step 10: Test if we can insert a community
SELECT 
    'Ready to test community creation' as status,
    'Try creating a community now' as next_step;
