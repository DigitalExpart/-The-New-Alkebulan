-- Check the structure of the messages table
-- Run this in Supabase SQL Editor to see what columns exist

-- Check if messages table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'messages'
ORDER BY ordinal_position;

-- Check if is_read column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'messages' 
            AND column_name = 'is_read'
        ) THEN '✅ is_read column exists'
        ELSE '❌ is_read column missing'
    END as is_read_status;

-- Check if message_type column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'messages' 
            AND column_name = 'message_type'
        ) THEN '✅ message_type column exists'
        ELSE '❌ message_type column missing'
    END as message_type_status;

-- Show sample data from messages table
SELECT 
    id,
    sender_id,
    conversation_id,
    content,
    created_at,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'messages' 
            AND column_name = 'is_read'
        ) THEN is_read
        ELSE 'Column does not exist'
    END as is_read_value,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'messages' 
            AND column_name = 'message_type'
        ) THEN message_type
        ELSE 'Column does not exist'
    END as message_type_value
FROM public.messages 
ORDER BY created_at DESC 
LIMIT 5;
