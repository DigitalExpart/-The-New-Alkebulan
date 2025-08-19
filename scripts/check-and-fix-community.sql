-- Check and Fix Community Issues
-- This will ensure the user can create posts

-- Step 1: Check if you have any communities
SELECT 
    'Your Communities:' as info
UNION ALL
SELECT 'Community: ' || name || ' (ID: ' || id || ')'
FROM public.communities 
WHERE created_by = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 2: Check if you're a member of any communities
SELECT 
    'Your Memberships:' as info
UNION ALL
SELECT 'Member of: ' || c.name || ' (Role: ' || cm.role || ')'
FROM public.community_members cm
JOIN public.communities c ON cm.community_id = c.id
WHERE cm.user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';

-- Step 3: Check community_posts table structure
SELECT 
    attname as column_name,
    format_type(atttypid, atttypmod) as data_type
FROM pg_attribute 
WHERE attrelid = 'public.community_posts'::regclass
AND attnum > 0 
AND NOT attisdropped
ORDER BY attnum;

-- Step 4: Test post creation directly
INSERT INTO public.community_posts (
    community_id,
    user_id,
    content,
    likes_count,
    comments_count
) VALUES (
    (SELECT id FROM public.communities WHERE created_by = '41c785f0-63c7-4f25-9727-84550e28bfb2' LIMIT 1),
    '41c785f0-63c7-4f25-9727-84550e28bfb2',
    'Test post from SQL',
    0,
    0
) RETURNING id, community_id, user_id, content;
