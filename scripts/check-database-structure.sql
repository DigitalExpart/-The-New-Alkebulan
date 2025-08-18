-- Check Database Structure for Community Posts
-- This script will verify if the new columns were added successfully

-- Check if the new columns exist in community_posts table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'community_posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if the new tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('media_uploads', 'post_feels');

-- Check if the trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'community_posts'
AND trigger_schema = 'public';
