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
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can edit their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON public.messages
    FOR DELETE USING (sender_id = auth.uid());

-- Function to update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update conversation timestamp when messages are added
CREATE TRIGGER update_conversation_timestamp_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Function to ensure at least 2 participants in a conversation
CREATE OR REPLACE FUNCTION ensure_conversation_participants()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a delete operation, check if we're removing the last participant
    IF TG_OP = 'DELETE' THEN
        IF (SELECT COUNT(*) FROM public.conversation_participants WHERE conversation_id = OLD.conversation_id) <= 1 THEN
            -- Delete the conversation if it's the last participant
            DELETE FROM public.conversations WHERE id = OLD.conversation_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle conversation cleanup
CREATE TRIGGER ensure_conversation_participants_trigger
    AFTER DELETE ON public.conversation_participants
    FOR EACH ROW
    EXECUTE FUNCTION ensure_conversation_participants();

-- Insert some sample data for testing (optional)
-- INSERT INTO public.conversations (id, title) VALUES 
--     ('550e8400-e29b-41d4-a716-446655440001', 'Sample Conversation 1'),
--     ('550e8400-e29b-41d4-a716-446655440002', 'Sample Conversation 2');

-- Grant permissions to authenticated users
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.conversation_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

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
COMMENT ON COLUMN public.conversation_participants.role IS 'User role in the conversation (owner, admin, moderator, member)';
COMMENT ON COLUMN public.messages.type IS 'Type of message (text, image, file, system)';
COMMENT ON COLUMN public.messages.reply_to_id IS 'ID of message being replied to';
COMMENT ON COLUMN public.messages.edited_at IS 'Timestamp when message was last edited';
COMMENT ON COLUMN public.messages.deleted_at IS 'Timestamp when message was deleted (soft delete)';

