-- Test Post Insert
-- This will help identify the exact error when inserting a post

-- First, let's see what we're working with
SELECT 
    'Current user:' as info, current_user as value
UNION ALL
SELECT 'Database:', current_database()
UNION ALL
SELECT 'Schema:', current_schema;

-- Try to insert a test post (this will show the exact error)
INSERT INTO public.community_posts (
    community_id,
    user_id,
    content,
    likes_count,
    comments_count
) VALUES (
    '8fceb414-7ff4-470f-885e-635422282536', -- Your community ID from the URL
    '00000000-0000-0000-0000-000000000000', -- Dummy user ID for testing
    'Test post content',
    0,
    0
);

-- If the above fails, let's check what columns are actually required
SELECT 
    column_name,
    is_nullable,
    column_default,
    data_type
FROM information_schema.columns 
WHERE table_name = 'community_posts' 
AND table_schema = 'public'
AND is_nullable = 'NO'
ORDER BY ordinal_position;
