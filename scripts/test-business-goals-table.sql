-- Test script to verify business_goals table setup
-- Run this in your Supabase SQL editor to check for issues

-- 1. Check if table exists
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'business_goals';

-- 2. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'business_goals'
ORDER BY ordinal_position;

-- 3. Check RLS policies
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
WHERE tablename = 'business_goals';

-- 4. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'business_goals';

-- 5. Check permissions
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'business_goals';

-- 6. Test insert (this will fail if RLS is blocking it)
-- Replace 'your-user-id-here' with an actual user ID from auth.users
/*
INSERT INTO public.business_goals (
  user_id, 
  title, 
  description, 
  category, 
  target, 
  current, 
  unit, 
  deadline, 
  status
) VALUES (
  'your-user-id-here',
  'Test Goal',
  'Test Description',
  'revenue',
  1000,
  0,
  'USD',
  '2024-12-31',
  'in_progress'
);
*/

-- 7. Check for any existing goals
SELECT 
  id,
  user_id,
  title,
  current,
  status,
  created_at
FROM public.business_goals
LIMIT 5;

-- 8. Check if there are any users in auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
LIMIT 5;
