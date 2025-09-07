-- Test script to verify messaging system is working
-- Run this after setting up the messaging tables

-- Check if tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'conversation_participants', 'messages')
ORDER BY table_name;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'conversation_participants', 'messages');

-- Check if policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, policyname;

-- Check if indexes exist
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, indexname;

-- Test data insertion (this will only work if you have users in auth.users)
-- Uncomment and modify these lines with actual user IDs from your auth.users table

-- Example: Create a test conversation
-- INSERT INTO public.conversations (title, is_group) 
-- VALUES ('Test Conversation', false)
-- RETURNING id;

-- Example: Add participants (replace with actual user IDs)
-- INSERT INTO public.conversation_participants (conversation_id, user_id, role)
-- VALUES 
--     ('conversation-id-from-above', 'user-id-1', 'owner'),
--     ('conversation-id-from-above', 'user-id-2', 'member');

-- Example: Add test messages (replace with actual IDs)
-- INSERT INTO public.messages (conversation_id, sender_id, content, type)
-- VALUES 
--     ('conversation-id-from-above', 'user-id-1', 'Hello! This is a test message.', 'text'),
--     ('conversation-id-from-above', 'user-id-2', 'Hi there! How are you?', 'text');

-- Query to get all conversations for a user (replace 'user-id' with actual user ID)
-- SELECT 
--     c.id,
--     c.title,
--     c.created_at,
--     c.last_message_at,
--     c.is_group,
--     COUNT(cp.user_id) as participant_count
-- FROM public.conversations c
-- JOIN public.conversation_participants cp ON c.id = cp.conversation_id
-- WHERE cp.user_id = 'user-id'
-- GROUP BY c.id, c.title, c.created_at, c.last_message_at, c.is_group
-- ORDER BY c.last_message_at DESC;

-- Query to get messages for a conversation (replace 'conversation-id' with actual conversation ID)
-- SELECT 
--     m.id,
--     m.content,
--     m.timestamp,
--     m.type,
--     m.sender_id,
--     p.first_name,
--     p.last_name
-- FROM public.messages m
-- LEFT JOIN public.profiles p ON m.sender_id = p.id
-- WHERE m.conversation_id = 'conversation-id'
-- ORDER BY m.timestamp ASC;
