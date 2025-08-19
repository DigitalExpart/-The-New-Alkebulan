-- Check Users and Authentication
-- This will help identify the user ID issue

-- 1. Check what users exist in the auth.users table
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
LIMIT 10;

-- 2. Check if there are any profiles for these users
SELECT 
    u.id as user_id,
    u.email,
    p.first_name,
    p.last_name,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LIMIT 10;

-- 3. Check the community_members table to see what users are members
SELECT 
    cm.user_id,
    cm.community_id,
    cm.role,
    cm.joined_at,
    u.email,
    c.name as community_name
FROM public.community_members cm
JOIN auth.users u ON cm.user_id = u.id
JOIN public.communities c ON cm.community_id = c.id
LIMIT 10;

-- 4. Check if the specific community exists
SELECT 
    id,
    name,
    description,
    member_count
FROM public.communities 
WHERE id = '8fceb414-7ff4-470f-885e-635422282536';

-- 5. Check the current session context
SELECT 
    'Current user context:' as info
UNION ALL
SELECT 'User ID from auth.uid(): ' || COALESCE(auth.uid()::text, 'NULL')
UNION ALL
SELECT 'Current user: ' || current_user
UNION ALL
SELECT 'Session user: ' || session_user;
