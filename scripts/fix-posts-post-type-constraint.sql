-- Fix Posts Post Type Constraint
-- This script checks and fixes the post_type check constraint

-- First, let's see what the current constraint allows
SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'posts'::regclass 
AND conname LIKE '%post_type%';

-- Check the current post_type column definition
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'post_type';

-- Drop the existing constraint if it exists
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;

-- Create a new, more permissive constraint for post_type
ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check 
CHECK (post_type IN ('text', 'image', 'video', 'media', 'link', 'poll', 'event'));

-- Test the constraint with our values
DO $$
BEGIN
    -- Test inserting with 'media' type
    INSERT INTO public.posts (
        user_id,
        content,
        post_type,
        created_at
    ) VALUES (
        auth.uid(),
        'Test media post',
        'media',
        NOW()
    );
    
    -- If we get here, the constraint works
    RAISE NOTICE 'Constraint test passed - media type is allowed';
    
    -- Clean up test data
    DELETE FROM public.posts WHERE content = 'Test media post';
    
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'Constraint test failed - media type not allowed';
    WHEN OTHERS THEN
        RAISE NOTICE 'Other error during constraint test: %', SQLERRM;
END $$;
