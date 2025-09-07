-- Debug script to check messaging system status
-- Run this in Supabase SQL Editor to diagnose issues

-- Check if user is authenticated
SELECT 
    'Current User Check' as check_type,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ User is authenticated'
        ELSE '❌ User is not authenticated'
    END as status,
    auth.uid() as user_id;

-- Check if messaging tables exist
SELECT 
    'Table Existence Check' as check_type,
    table_name,
    CASE 
        WHEN table_name = 'conversations' THEN '✅ Conversations table exists'
        WHEN table_name = 'conversation_participants' THEN '✅ Conversation participants table exists'
        WHEN table_name = 'messages' THEN '✅ Messages table exists'
        ELSE '❌ Unknown table'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'conversation_participants', 'messages')
ORDER BY table_name;

-- Check if RPC function exists
SELECT 
    'RPC Function Check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'create_conversation_and_participants' 
            AND routine_schema = 'public'
        ) THEN '✅ RPC function exists'
        ELSE '❌ RPC function missing'
    END as status;

-- Check current user's conversations (if authenticated)
SELECT 
    'User Conversations Check' as check_type,
    COUNT(*) as conversation_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ User has conversations'
        ELSE '❌ User has no conversations'
    END as status
FROM public.conversation_participants 
WHERE user_id = auth.uid();

-- Check all conversations in the system
SELECT 
    'System Conversations Check' as check_type,
    COUNT(*) as total_conversations,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ System has conversations'
        ELSE '❌ System has no conversations'
    END as status
FROM public.conversations;

-- Check all messages in the system
SELECT 
    'System Messages Check' as check_type,
    COUNT(*) as total_messages,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ System has messages'
        ELSE '❌ System has no messages'
    END as status
FROM public.messages;

-- Show sample conversations (if any exist)
SELECT 
    'Sample Conversations' as check_type,
    c.id,
    c.created_at,
    COUNT(cp.user_id) as participant_count
FROM public.conversations c
LEFT JOIN public.conversation_participants cp ON c.id = cp.conversation_id
GROUP BY c.id, c.created_at
ORDER BY c.created_at DESC
LIMIT 5;
