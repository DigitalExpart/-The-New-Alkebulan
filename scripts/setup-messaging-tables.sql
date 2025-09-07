-- Complete Messaging System Setup
-- This script creates all necessary tables for the messaging functionality

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing messaging tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Create the conversations table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    title TEXT, -- Optional group chat title
    is_group BOOLEAN DEFAULT FALSE
);

-- Create the conversation_participants table
CREATE TABLE public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_read_message_id UUID,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    is_muted BOOLEAN DEFAULT FALSE,
    notification_level TEXT DEFAULT 'all' CHECK (notification_level IN ('all', 'mentions', 'none')),
    theme TEXT DEFAULT 'default' CHECK (theme IN ('default', 'gold', 'forest', 'contrast')),
    is_archived BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    cleared_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (conversation_id, user_id)
);

-- Create the messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
    reply_to_id UUID REFERENCES public.messages(id), -- For reply functionality
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    media_url TEXT,
    file_extension TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for participants" ON public.conversations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.conversations;
DROP POLICY IF EXISTS "Enable update for participants" ON public.conversations;

DROP POLICY IF EXISTS "Enable read access for participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.conversation_participants;
DROP POLICY IF EXISTS "Enable update for participants" ON public.conversation_participants;

DROP POLICY IF EXISTS "Enable read access for participants" ON public.messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.messages;
DROP POLICY IF EXISTS "Enable update for sender" ON public.messages;

-- Create RLS policies for conversations
CREATE POLICY "Enable read access for participants" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = conversations.id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Enable insert for authenticated users" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for participants" ON public.conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = conversations.id 
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Create RLS policies for conversation_participants
CREATE POLICY "Enable read access for participants" ON public.conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id 
            AND cp2.user_id = auth.uid()
        )
    );

CREATE POLICY "Enable insert for authenticated users" ON public.conversation_participants
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id 
            AND cp.user_id = auth.uid()
            AND cp.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Enable update for participants" ON public.conversation_participants
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id 
            AND cp.user_id = auth.uid()
            AND cp.role IN ('owner', 'admin')
        )
    );

-- Create RLS policies for messages
CREATE POLICY "Enable read access for participants" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Enable insert for authenticated users" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Enable update for sender" ON public.messages
    FOR UPDATE USING (
        auth.uid() = sender_id AND
        deleted_at IS NULL
    );

-- Create function to update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET updated_at = NOW(), last_message_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update conversation timestamp when message is inserted
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Create function to automatically add conversation participants
CREATE OR REPLACE FUNCTION add_conversation_participants()
RETURNS TRIGGER AS $$
BEGIN
    -- Add the creator as owner
    INSERT INTO public.conversation_participants (conversation_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'owner')
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically add conversation creator as participant
CREATE TRIGGER add_conversation_creator
    AFTER INSERT ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION add_conversation_participants();

-- Insert some sample data for testing (optional)
-- This creates a sample conversation between two users for testing
INSERT INTO public.conversations (id, title, is_group) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Sample Conversation', false);

-- Note: You'll need to replace these UUIDs with actual user IDs from your auth.users table
-- INSERT INTO public.conversation_participants (conversation_id, user_id, role)
-- VALUES 
--     ('00000000-0000-0000-0000-000000000001', 'user-uuid-1', 'owner'),
--     ('00000000-0000-0000-0000-000000000001', 'user-uuid-2', 'member');

-- INSERT INTO public.messages (conversation_id, sender_id, content, type)
-- VALUES 
--     ('00000000-0000-0000-0000-000000000001', 'user-uuid-1', 'Hello! This is a test message.', 'text'),
--     ('00000000-0000-0000-0000-000000000001', 'user-uuid-2', 'Hi there! How are you?', 'text');

-- Grant necessary permissions
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.conversation_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
