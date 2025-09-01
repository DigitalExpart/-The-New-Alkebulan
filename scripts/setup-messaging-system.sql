-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_message_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create the conversation_participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    last_read_message_id uuid,
    role text DEFAULT 'member', -- Added role column
    UNIQUE (conversation_id, user_id)
);

-- Create index on conversation_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);

-- Create the messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text,
    message_type text DEFAULT 'text' NOT NULL, -- e.g., 'text', 'image', 'video', 'audio', 'document'
    media_url text,
    file_extension text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create index on conversation_id for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

-- Enable Row Level Security (RLS) for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for participants" ON public.conversations;
CREATE POLICY "Enable read access for participants" ON public.conversations
    FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
);

-- Enable RLS for conversation_participants
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for participants" ON public.conversation_participants;
CREATE POLICY "Enable read access for participants" ON public.conversation_participants
FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.conversation_participants;
CREATE POLICY "Enable insert for participant or partner"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  -- Allow inserting own participant row
  user_id = auth.uid()
  -- Or allow inserting partner row when the current user is already a participant in the same conversation
  OR EXISTS (
    SELECT 1
    FROM public.conversation_participants cp2
    WHERE cp2.conversation_id = conversation_id
      AND cp2.user_id = auth.uid()
  )
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for participants" ON public.messages;
CREATE POLICY "Enable read access for participants" ON public.messages
    FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.messages;
CREATE POLICY "Enable insert for authenticated users" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Function to update updated_at in conversations on new message
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET updated_at = NEW.created_at,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger to ensure idempotency
DROP TRIGGER IF EXISTS trg_update_conversation_timestamp ON public.messages;

-- Create trigger for updating conversation timestamp
CREATE TRIGGER trg_update_conversation_timestamp
    AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

-- Function to create a conversation and add participants if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_conversation_and_participants(
    p_user_ids uuid[]
)
RETURNS uuid AS $$
DECLARE
    v_conversation_id uuid;
    v_existing_conversation_id uuid;
    v_current_user uuid := auth.uid();
BEGIN
    -- Sort the user IDs to ensure consistent ordering for conversation lookup
    SELECT ARRAY(SELECT unnest(p_user_ids) ORDER BY 1) INTO p_user_ids;

    -- Check if a conversation with these exact participants already exists
    SELECT cp.conversation_id
    INTO v_existing_conversation_id
    FROM public.conversation_participants cp
    WHERE cp.user_id = p_user_ids[1] -- Assuming 1:1 chat for simplicity initially
    GROUP BY cp.conversation_id
    HAVING COUNT(cp.user_id) = 2 AND -- Assuming 2 participants for 1:1 chat
           ARRAY(SELECT user_id FROM public.conversation_participants WHERE conversation_id = cp.conversation_id ORDER BY user_id) = p_user_ids;

    IF v_existing_conversation_id IS NOT NULL THEN
        RETURN v_existing_conversation_id;
  END IF;
  
    -- If no existing conversation, create a new one
    INSERT INTO public.conversations DEFAULT VALUES RETURNING id INTO v_conversation_id;

    -- Insert current user first (satisfies RLS)
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (v_conversation_id, v_current_user);

    -- Insert the partner(s) (allowed by RLS because current user row now exists)
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    SELECT v_conversation_id, uid
    FROM unnest(p_user_ids) AS uid
    WHERE uid <> v_current_user;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Wrapper for legacy/frontend RPC signature: accepts a single other_user_id
-- and builds the sorted participants array using the current auth user
DROP FUNCTION IF EXISTS public.create_conversation_and_participants(uuid);
CREATE OR REPLACE FUNCTION public.create_conversation_and_participants(
    other_user_id uuid
)
RETURNS uuid AS $$
DECLARE
    current_user_id uuid := auth.uid();
    v_conversation_id uuid;
    ids uuid[];
BEGIN
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
  END IF;
  
    -- Build and sort ids for consistent lookup
    ids := ARRAY[current_user_id, other_user_id];
    SELECT ARRAY(SELECT unnest(ids) ORDER BY 1) INTO ids;

    -- Delegate to the array-based implementation
    v_conversation_id := public.create_conversation_and_participants(ids);
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RPC function for sending voice note
CREATE OR REPLACE FUNCTION public.send_voice_note(
    p_conversation_id uuid,
    p_sender_id uuid,
    p_media_url text
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.messages (conversation_id, sender_id, content, message_type, media_url)
    VALUES (p_conversation_id, p_sender_id, p_media_url, 'audio', p_media_url);
END;
$$ LANGUAGE plpgsql;

-- Supabase Storage setup for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_attachments', 'chat_attachments', TRUE)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage bucket
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- Allow authenticated users to upload to 'chat_attachments'
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat_attachments' AND auth.role() = 'authenticated');

-- Allow public read access to 'chat_attachments'
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'chat_attachments');
