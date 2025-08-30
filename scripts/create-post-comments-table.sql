-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id uuid NOT NULL, -- Removed FOREIGN KEY constraint to support both public.posts and public.community_posts
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) for post_comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies to ensure idempotency
DROP POLICY IF EXISTS "Enable read access for all users" ON public.post_comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.post_comments;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.post_comments;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.post_comments;

-- RLS Policy: Allow all users to read comments
CREATE POLICY "Enable read access for all users" ON public.post_comments
FOR SELECT USING (TRUE);

-- RLS Policy: Allow authenticated users to insert comments
CREATE POLICY "Enable insert for authenticated users only" ON public.post_comments
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- RLS Policy: Allow users to update their own comments
CREATE POLICY "Enable update for users based on user_id" ON public.post_comments
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Allow users to delete their own comments
CREATE POLICY "Enable delete for users based on user_id" ON public.post_comments
FOR DELETE USING (auth.uid() = user_id);

-- Function to update comments_count on both public.posts and public.community_posts
CREATE OR REPLACE FUNCTION public.update_generic_post_comments_count() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    -- Handle updates for public.posts
    IF EXISTS (SELECT 1 FROM public.posts WHERE id = NEW.post_id) THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        END IF;
    -- Handle updates for public.community_posts
    ELSIF EXISTS (SELECT 1 FROM public.community_posts WHERE id = NEW.post_id) THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.community_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Drop existing trigger to ensure idempotency
DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON public.post_comments;

-- Create the new trigger
CREATE TRIGGER update_post_comments_count_trigger
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_generic_post_comments_count();

-- Create the post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id uuid NOT NULL,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (post_id, user_id)
);

-- Enable RLS for post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.post_likes;
CREATE POLICY "Enable read access for all users" ON public.post_likes
FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.post_likes;
CREATE POLICY "Enable insert for authenticated users only" ON public.post_likes
FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.post_likes;
CREATE POLICY "Enable delete for users based on user_id" ON public.post_likes
FOR DELETE USING (auth.uid() = user_id);

-- Function to update likes_count on posts table
CREATE OR REPLACE FUNCTION public.update_generic_post_likes_count() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    -- Handle updates for public.posts
    IF EXISTS (SELECT 1 FROM public.posts WHERE id = NEW.post_id) THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        END IF;
    -- Handle updates for public.community_posts
    ELSIF EXISTS (SELECT 1 FROM public.community_posts WHERE id = NEW.post_id) THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Drop existing trigger to ensure idempotency
DROP TRIGGER IF EXISTS update_post_likes_count_trigger ON public.post_likes;

-- Create the new trigger
CREATE TRIGGER update_post_likes_count_trigger
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_generic_post_likes_count();
