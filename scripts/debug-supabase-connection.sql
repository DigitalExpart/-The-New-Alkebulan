-- Debug Supabase Connection Issues
-- This script helps diagnose connection and configuration problems

-- 1. Check if the post-media bucket exists and its configuration
SELECT 
    id,
    name,
    public,
    file_size_limit,
    file_size_limit / 1024 / 1024 as file_size_limit_mb,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets 
WHERE name = 'post-media';

-- 2. Check storage policies for the post-media bucket
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
AND schemaname = 'storage'
AND policyname LIKE '%post-media%';

-- 3. Check if there are any objects in the post-media bucket
SELECT 
    bucket_id,
    name,
    size,
    size / 1024 / 1024 as size_mb,
    created_at,
    updated_at
FROM storage.objects 
WHERE bucket_id = 'post-media'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check authentication status
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- 5. Test if we can create a test object (this will fail if there are permission issues)
-- Uncomment the lines below to test upload permissions
/*
INSERT INTO storage.objects (bucket_id, name, size, mime_type, owner)
VALUES ('post-media', 'test-file.txt', 0, 'text/plain', auth.uid())
ON CONFLICT (bucket_id, name) DO NOTHING;

-- Clean up test file
DELETE FROM storage.objects 
WHERE bucket_id = 'post-media' AND name = 'test-file.txt';
*/

-- 6. Check for any recent errors in the logs (if available)
-- This query might not work depending on your Supabase plan
SELECT 
    timestamp,
    level,
    message,
    metadata
FROM logs 
WHERE timestamp > NOW() - INTERVAL '1 hour'
AND (message LIKE '%storage%' OR message LIKE '%upload%' OR message LIKE '%error%')
ORDER BY timestamp DESC
LIMIT 20;
