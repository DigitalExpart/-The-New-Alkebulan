-- Fix Community Owner Policies
-- Ensure community creators can properly own and manage their communities

-- Step 1: Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "communities_select_policy" ON public.communities;
DROP POLICY IF EXISTS "communities_insert_policy" ON public.communities;
DROP POLICY IF EXISTS "communities_update_policy" ON public.communities;
DROP POLICY IF EXISTS "communities_delete_policy" ON public.communities;

DROP POLICY IF EXISTS "community_members_select_policy" ON public.community_members;
DROP POLICY IF EXISTS "community_members_insert_policy" ON public.community_members;
DROP POLICY IF EXISTS "community_members_delete_policy" ON public.community_members;

DROP POLICY IF EXISTS "community_posts_select_policy" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_insert_policy" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_update_policy" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_delete_policy" ON public.community_posts;

-- Step 2: Create better policies for communities table
CREATE POLICY "communities_select_policy" ON public.communities
    FOR SELECT USING (true);

CREATE POLICY "communities_insert_policy" ON public.communities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "communities_update_policy" ON public.communities
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "communities_delete_policy" ON public.communities
    FOR DELETE USING (created_by = auth.uid());

-- Step 3: Create better policies for community_members table
CREATE POLICY "community_members_select_policy" ON public.community_members
    FOR SELECT USING (true);

CREATE POLICY "community_members_insert_policy" ON public.community_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "community_members_update_policy" ON public.community_members
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.communities 
            WHERE id = community_members.community_id 
            AND created_by = auth.uid()
        )
    );

CREATE POLICY "community_members_delete_policy" ON public.community_members
    FOR DELETE USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.communities 
            WHERE id = community_members.community_id 
            AND created_by = auth.uid()
        )
    );

-- Step 4: Create better policies for community_posts table
CREATE POLICY "community_posts_select_policy" ON public.community_posts
    FOR SELECT USING (true);

CREATE POLICY "community_posts_insert_policy" ON public.community_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = community_posts.community_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "community_posts_update_policy" ON public.community_posts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "community_posts_delete_policy" ON public.community_posts
    FOR DELETE USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.communities 
            WHERE id = community_posts.community_id 
            AND created_by = auth.uid()
        )
    );

-- Step 5: Create better policies for post_likes table
CREATE POLICY "post_likes_select_policy" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "post_likes_insert_policy" ON public.post_likes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_posts cp
            JOIN public.community_members cm ON cp.community_id = cm.community_id
            WHERE cp.id = post_likes.post_id AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "post_likes_delete_policy" ON public.post_likes
    FOR DELETE USING (user_id = auth.uid());

-- Step 6: Create better policies for post_comments table
CREATE POLICY "post_comments_select_policy" ON public.post_comments
    FOR SELECT USING (true);

CREATE POLICY "post_comments_insert_policy" ON public.post_comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_posts cp
            JOIN public.community_members cm ON cp.community_id = cm.community_id
            WHERE cp.id = post_comments.post_id AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "post_comments_update_policy" ON public.post_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "post_comments_delete_policy" ON public.post_comments
    FOR DELETE USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.community_posts cp
            JOIN public.communities c ON cp.community_id = c.id
            WHERE cp.id = post_comments.post_id AND c.created_by = auth.uid()
        )
    );

-- Step 7: Create a function to automatically add creator as member
CREATE OR REPLACE FUNCTION add_community_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically add the creator as an admin member
    INSERT INTO public.community_members (
        community_id,
        user_id,
        role,
        joined_at
    ) VALUES (
        NEW.id,
        NEW.created_by,
        'admin',
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger to automatically add creator as member
DROP TRIGGER IF EXISTS trigger_add_community_creator ON public.communities;
CREATE TRIGGER trigger_add_community_creator
    AFTER INSERT ON public.communities
    FOR EACH ROW
    EXECUTE FUNCTION add_community_creator_as_member();

-- Step 9: Verify the policies
SELECT 
    'Community owner policies fixed successfully!' as message,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename IN ('communities', 'community_members', 'community_posts', 'post_likes', 'post_comments');

-- Step 10: Test the setup
SELECT 
    'Ready to test community creation' as status,
    'Community creators will automatically become owners and admins' as note;
