-- Create Friendships Table for Diaspora Market Hub
-- Run this script in your Supabase SQL Editor to create the friendships table

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.friendships CASCADE;

-- Create friendships table
CREATE TABLE public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Create indexes for better performance
CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);
CREATE INDEX idx_friendships_created_at ON public.friendships(created_at);

-- Enable Row Level Security
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view friendships they are part of
CREATE POLICY "Users can view their own friendships" ON public.friendships
    FOR SELECT USING (
        auth.uid() = user_id OR auth.uid() = friend_id
    );

-- Users can create friendship requests
CREATE POLICY "Users can create friendship requests" ON public.friendships
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Users can update their own friendship requests
CREATE POLICY "Users can update their own friendships" ON public.friendships
    FOR UPDATE USING (
        auth.uid() = user_id OR auth.uid() = friend_id
    );

-- Users can delete their own friendship requests
CREATE POLICY "Users can delete their own friendships" ON public.friendships
    FOR DELETE USING (
        auth.uid() = user_id OR auth.uid() = friend_id
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_friendships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_friendships_updated_at
    BEFORE UPDATE ON public.friendships
    FOR EACH ROW
    EXECUTE FUNCTION update_friendships_updated_at();

-- Insert some sample data (optional)
-- INSERT INTO public.friendships (user_id, friend_id, status) VALUES 
-- ('sample-user-id-1', 'sample-user-id-2', 'accepted'),
-- ('sample-user-id-1', 'sample-user-id-3', 'pending');

-- Grant permissions to authenticated users
GRANT ALL ON public.friendships TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Success message
SELECT 'Friendships table created successfully!' as message;
