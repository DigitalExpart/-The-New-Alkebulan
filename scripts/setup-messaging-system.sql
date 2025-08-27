-- Setup Messaging System for Diaspora Market Hub
-- Run this script in your Supabase SQL Editor to create the messaging tables

-- Create modern messaging system tables
-- This replaces the old sender/receiver system with conversations and participants

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Conversations table
CREATE TABLE public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT, -- Optional group chat title
    is_group BOOLEAN DEFAULT FALSE
);

-- Conversation participants table
CREATE TABLE public.conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    -- Per-user settings for a conversation
    is_muted BOOLEAN DEFAULT FALSE,
    notification_level TEXT DEFAULT 'all' CHECK (notification_level IN ('all','mentions','none')),
    theme TEXT DEFAULT 'default' CHECK (theme IN ('default','gold','forest','contrast')),
    is_archived BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    cleared_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
    reply_to_id UUID REFERENCES public.messages(id), -- For reply functionality
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at);
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Conversation owners can update conversations" ON public.conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = id AND cp.user_id = auth.uid() AND cp.role = 'owner'
        )
    );

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join conversations" ON public.conversation_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave conversations" ON public.conversation_participants
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to conversations they participate in" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON public.messages
    FOR DELETE USING (sender_id = auth.uid());

-- Create function to update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update conversation timestamp when messages are added
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Grant permissions
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.conversation_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.conversations IS 'Chat conversations between users';
COMMENT ON TABLE public.conversation_participants IS 'Users participating in conversations';
COMMENT ON COLUMN public.conversation_participants.is_muted IS 'Whether the user muted this conversation';
COMMENT ON COLUMN public.conversation_participants.notification_level IS 'Notification preference for this conversation';
COMMENT ON COLUMN public.conversation_participants.theme IS 'Preferred theme for this conversation';
COMMENT ON COLUMN public.conversation_participants.is_archived IS 'Whether the user archived this conversation';
COMMENT ON COLUMN public.conversation_participants.is_locked IS 'Locks sending messages for this user in the conversation';
COMMENT ON COLUMN public.conversation_participants.cleared_at IS 'Only show messages on/after this timestamp for this user';
COMMENT ON TABLE public.messages IS 'Individual messages within conversations';
COMMENT ON COLUMN public.conversations.title IS 'Optional title for group chats';
COMMENT ON COLUMN public.conversations.is_group IS 'Whether this is a group chat or direct message';

-- Insert some sample data for testing (optional)
-- INSERT INTO public.conversations (id, title, is_group) VALUES
--   (gen_random_uuid(), 'Welcome to Diaspora Market Hub', true),
--   (gen_random_uuid(), 'General Discussion', true);

-- Show success message
SELECT 'Messaging system tables created successfully!' as status;

-- Presence support additions (safe to re-run)
alter table if exists public.profiles
  add column if not exists is_online boolean default false,
  add column if not exists last_seen timestamptz;

create or replace function public.set_presence(online boolean)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
    set is_online = online,
        last_seen = now()
  where id = auth.uid();
end;
$$;
