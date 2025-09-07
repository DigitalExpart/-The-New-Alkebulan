-- Create RPC function for creating conversations and participants
-- This function is called by the frontend when starting a new conversation

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.create_conversation_and_participants(uuid);

-- Create the RPC function
CREATE OR REPLACE FUNCTION public.create_conversation_and_participants(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_conversation_id uuid;
    current_user_id uuid;
BEGIN
    -- Get the current authenticated user
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to create conversations';
    END IF;
    
    -- Check if other_user_id exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = other_user_id) THEN
        RAISE EXCEPTION 'Target user does not exist';
    END IF;
    
    -- Check if conversation already exists between these two users
    SELECT c.id INTO new_conversation_id
    FROM public.conversations c
    WHERE c.id IN (
        SELECT cp1.conversation_id
        FROM public.conversation_participants cp1
        JOIN public.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
        WHERE cp1.user_id = current_user_id
        AND cp2.user_id = other_user_id
        AND cp1.conversation_id NOT IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            GROUP BY conversation_id 
            HAVING COUNT(*) > 2
        )
    )
    LIMIT 1;
    
    -- If conversation exists, return it
    IF new_conversation_id IS NOT NULL THEN
        RETURN new_conversation_id;
    END IF;
    
    -- Create new conversation
    INSERT INTO public.conversations (id, created_at, updated_at, last_message_at, is_group)
    VALUES (gen_random_uuid(), NOW(), NOW(), NOW(), false)
    RETURNING id INTO new_conversation_id;
    
    -- Add current user as participant
    INSERT INTO public.conversation_participants (conversation_id, user_id, role, joined_at)
    VALUES (new_conversation_id, current_user_id, 'owner', NOW());
    
    -- Add other user as participant
    INSERT INTO public.conversation_participants (conversation_id, user_id, role, joined_at)
    VALUES (new_conversation_id, other_user_id, 'member', NOW());
    
    -- Return the new conversation ID
    RETURN new_conversation_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_conversation_and_participants(uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.create_conversation_and_participants(uuid) IS 'Creates a new conversation between the current user and another user, or returns existing conversation if it already exists';
