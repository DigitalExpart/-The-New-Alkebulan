-- Check if messaging tables exist in your Supabase database
-- Run this in your Supabase SQL Editor to see which tables are present

-- Check if messaging tables exist
SELECT 
    table_name,
    table_type,
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

-- If no results above, check what tables do exist
SELECT 
    'Available tables in public schema:' as info,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Show all tables in public schema (to see what's available)
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if RLS (Row Level Security) is enabled on messaging tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        WHEN rowsecurity = false THEN '❌ RLS Disabled'
        ELSE '❓ Unknown'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename;

-- Check if policies exist for messaging tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, policyname;

-- Summary report
SELECT 
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ All messaging tables exist'
        WHEN COUNT(*) = 0 THEN '❌ No messaging tables found'
        ELSE '⚠️ Some messaging tables missing (' || COUNT(*) || '/3)'
    END as summary
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'conversation_participants', 'messages');
