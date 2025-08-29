-- Create post_shares table
CREATE TABLE IF NOT EXISTS public.post_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Enable Row Level Security (RLS) for post_shares
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies to ensure idempotency
DROP POLICY IF EXISTS "Enable read access for all users" ON public.post_shares;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.post_shares;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.post_shares;

-- RLS Policy: Allow all users to read shares (if the post is visible)
CREATE POLICY "Enable read access for all users" ON public.post_shares
FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.community_posts cp
    JOIN public.community_members cm ON cp.community_id = cm.community_id
    WHERE cp.id = post_shares.post_id AND cm.user_id = auth.uid()
));

-- RLS Policy: Allow authenticated users to insert shares
CREATE POLICY "Enable insert for authenticated users only" ON public.post_shares
FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.community_posts cp
    JOIN public.community_members cm ON cp.community_id = cm.community_id
    WHERE cp.id = post_shares.post_id AND cm.user_id = auth.uid()
));

-- RLS Policy: Allow users to delete their own shares
CREATE POLICY "Enable delete for users based on user_id" ON public.post_shares
FOR DELETE USING (auth.uid() = user_id);

-- Function to update shares_count on community_posts table
CREATE OR REPLACE FUNCTION public.update_post_share_count() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts SET shares_count = shares_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Drop existing trigger to ensure idempotency
DROP TRIGGER IF EXISTS update_post_share_count_trigger ON public.post_shares;

-- Create the new trigger
CREATE TRIGGER update_post_share_count_trigger
AFTER INSERT OR DELETE ON public.post_shares
FOR EACH ROW EXECUTE FUNCTION public.update_post_share_count();
