-- Test Media Upload Debug Script
-- This script helps debug media upload issues by checking table structure and permissions

-- Check if posts table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND table_schema = 'public' 
ORDER BY ordinal_position;

-- Check RLS policies on posts table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'posts';

-- Check if post-media storage bucket exists
SELECT name, public 
FROM storage.buckets 
WHERE name = 'post-media';

-- Check storage policies for post-media bucket
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Test a simple insert to see if there are any constraint issues
-- (This will be rolled back)
BEGIN;
INSERT INTO public.posts (
    user_id,
    content,
    image_url,
    metadata,
    post_type,
    created_at
) VALUES (
    auth.uid(),
    'Test post for debugging',
    null,
    '{"test": true}'::jsonb,
    'text',
    NOW()
);
ROLLBACK;

-- Check if there are any triggers on posts table that might be causing issues
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'posts';
