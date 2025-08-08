-- RLS Policy Adjustments Script
-- Run this if RLS policies are blocking operations

-- ============================================================================
-- MORE PERMISSIVE PROFILES POLICIES
-- ============================================================================

-- Allow public read access to profiles (for displaying user info)
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles
    FOR SELECT USING (true);

-- Keep existing policies for authenticated users
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- MORE PERMISSIVE POSTS POLICIES
-- ============================================================================

-- Allow authenticated users to view all posts (for debugging)
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.posts;
CREATE POLICY "Authenticated users can view all posts" ON public.posts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Keep existing policies
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
CREATE POLICY "Public posts are viewable by everyone" ON public.posts
    FOR SELECT USING (privacy = 'public');

DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
CREATE POLICY "Users can view their own posts" ON public.posts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
CREATE POLICY "Users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- MORE PERMISSIVE LIKES POLICIES
-- ============================================================================

-- Allow authenticated users to view all likes
DROP POLICY IF EXISTS "Authenticated users can view all likes" ON public.post_likes;
CREATE POLICY "Authenticated users can view all likes" ON public.post_likes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to like any post
DROP POLICY IF EXISTS "Authenticated users can like any post" ON public.post_likes;
CREATE POLICY "Authenticated users can like any post" ON public.post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Keep existing policies
DROP POLICY IF EXISTS "Users can view likes on visible posts" ON public.post_likes;
CREATE POLICY "Users can view likes on visible posts" ON public.post_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_likes.post_id 
            AND (posts.privacy = 'public' OR posts.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can like visible posts" ON public.post_likes;
CREATE POLICY "Users can like visible posts" ON public.post_likes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_id 
            AND (posts.privacy = 'public' OR posts.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can remove their own likes" ON public.post_likes;
CREATE POLICY "Users can remove their own likes" ON public.post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- MORE PERMISSIVE COMMENTS POLICIES
-- ============================================================================

-- Allow authenticated users to view all comments
DROP POLICY IF EXISTS "Authenticated users can view all comments" ON public.post_comments;
CREATE POLICY "Authenticated users can view all comments" ON public.post_comments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to comment on any post
DROP POLICY IF EXISTS "Authenticated users can comment on any post" ON public.post_comments;
CREATE POLICY "Authenticated users can comment on any post" ON public.post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Keep existing policies
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON public.post_comments;
CREATE POLICY "Users can view comments on visible posts" ON public.post_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_comments.post_id 
            AND (posts.privacy = 'public' OR posts.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can comment on visible posts" ON public.post_comments;
CREATE POLICY "Users can comment on visible posts" ON public.post_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_id 
            AND (posts.privacy = 'public' OR posts.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can update own comments" ON public.post_comments;
CREATE POLICY "Users can update own comments" ON public.post_comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
CREATE POLICY "Users can delete own comments" ON public.post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TEMPORARY DISABLE RLS (FOR DEBUGGING ONLY)
-- ============================================================================

-- Uncomment these lines if you need to temporarily disable RLS for debugging
-- WARNING: This will disable all security policies - only use for testing!

-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.post_likes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.post_comments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.post_shares DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.comment_likes DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'posts', 'post_likes', 'post_comments', 'post_shares', 'comment_likes')
ORDER BY tablename, policyname;

-- Show RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'posts', 'post_likes', 'post_comments', 'post_shares', 'comment_likes')
ORDER BY tablename;

-- Success message
SELECT 'RLS policy adjustments completed. If you still have issues, consider temporarily disabling RLS for debugging.' as result; 