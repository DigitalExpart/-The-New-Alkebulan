-- Test RLS for Communities Table
-- This will help identify if RLS policies are blocking community creation

-- 1. Check if RLS is enabled on communities table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'communities';

-- 2. Check what RLS policies exist
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'communities';

-- 3. Check the current user context
SELECT 
    'Current user context:' as info
UNION ALL
SELECT 'User ID from auth.uid(): ' || COALESCE(auth.uid()::text, 'NULL')
UNION ALL
SELECT 'Current user: ' || current_user
UNION ALL
SELECT 'Session user: ' || session_user;

-- 4. Try to temporarily disable RLS to test if that's the issue
-- (This is just for testing - we'll re-enable it after)
ALTER TABLE public.communities DISABLE ROW LEVEL SECURITY;

-- 5. Test if we can now insert (this should work if RLS was the issue)
INSERT INTO public.communities (
    name,
    description,
    category,
    created_by,
    member_count,
    status
) VALUES (
    'Test Community',
    'This is a test community to check if RLS was blocking inserts',
    'Technology',
    '00000000-0000-0000-0000-000000000000', -- Dummy user ID
    1,
    'active'
) RETURNING id, name;

-- 6. Clean up the test data
DELETE FROM public.communities WHERE name = 'Test Community';

-- 7. Re-enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
