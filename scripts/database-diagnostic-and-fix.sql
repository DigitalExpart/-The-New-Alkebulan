-- Database Diagnostic and Fix Script
-- Run this in your Supabase SQL Editor to diagnose and fix common issues

-- ============================================================================
-- STEP 1: DIAGNOSTIC CHECKS
-- ============================================================================

-- Check if posts table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') 
        THEN '✅ Posts table exists' 
        ELSE '❌ Posts table does not exist - will create it' 
    END as posts_table_status;

-- Check if profiles table exists and its structure
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') 
        THEN '✅ Profiles table exists' 
        ELSE '❌ Profiles table does not exist - will create it' 
    END as profiles_table_status;

-- Check profiles table columns if it exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check for foreign key constraint issues
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('profiles', 'posts', 'post_likes', 'post_comments', 'post_shares');

-- ============================================================================
-- STEP 2: CREATE POSTS TABLE IF IT DOESN'T EXIST
-- ============================================================================

-- Create posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    post_type VARCHAR(20) DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'link', 'poll')),
    privacy VARCHAR(20) DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private')),
    metadata JSONB DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create related tables if they don't exist
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.post_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    share_type VARCHAR(20) DEFAULT 'repost' CHECK (share_type IN ('repost', 'quote', 'external')),
    share_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, share_type)
);

CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- ============================================================================
-- STEP 3: FIX PROFILES TABLE ISSUES
-- ============================================================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    ethnicity TEXT,
    languages TEXT[],
    interests TEXT[],
    skills TEXT[],
    education TEXT,
    occupation TEXT,
    company TEXT,
    social_links JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    verification_level VARCHAR(20) DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Fix foreign key constraints on profiles table
DO $$
BEGIN
    -- Drop problematic constraint if it exists
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    
    -- Add correct foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_fkey' 
        AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint profiles_user_id_fkey';
    END IF;
    
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_unique' 
        AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint profiles_user_id_unique';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts policies
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

-- Likes policies
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

-- Comments policies
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
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Posts indexes
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts (user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS posts_privacy_idx ON public.posts (privacy);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles (user_id);

-- Likes indexes
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON public.post_likes (post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON public.post_likes (user_id);

-- Comments indexes
CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON public.post_comments (post_id);
CREATE INDEX IF NOT EXISTS post_comments_user_id_idx ON public.post_comments (user_id);

-- ============================================================================
-- STEP 7: CREATE UPDATED_AT TRIGGER
-- ============================================================================

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.post_comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 8: FINAL VERIFICATION
-- ============================================================================

-- Verify all tables exist
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = table_name) 
        THEN '✅ Exists' 
        ELSE '❌ Missing' 
    END as status
FROM (VALUES ('profiles'), ('posts'), ('post_likes'), ('post_comments'), ('post_shares'), ('comment_likes')) AS t(table_name);

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'posts', 'post_likes', 'post_comments', 'post_shares', 'comment_likes')
ORDER BY tablename;

-- Show final constraint list
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('profiles', 'posts', 'post_likes', 'post_comments', 'post_shares', 'comment_likes')
ORDER BY tc.table_name, tc.constraint_name;

-- Success message
SELECT 'Database diagnostic and fix completed successfully! All tables should now be properly configured.' as result; 