-- Check if product_images table exists and its structure
-- Run this in your Supabase SQL Editor

-- 1. Check if the table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'product_images'
) as table_exists;

-- 2. If table exists, show its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'product_images'
ORDER BY ordinal_position;

-- 3. Check if there are any rows in the table
SELECT COUNT(*) as total_images FROM public.product_images;

-- 4. Show sample data if any exists
SELECT * FROM public.product_images LIMIT 5;

-- 5. Check RLS policies on the table
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'product_images' 
AND schemaname = 'public';

-- 6. Check if the table is accessible to the current user
SELECT 
  has_table_privilege('public.product_images', 'SELECT') as can_select,
  has_table_privilege('public.product_images', 'INSERT') as can_insert,
  has_table_privilege('public.product_images', 'UPDATE') as can_update,
  has_table_privilege('public.product_images', 'DELETE') as can_delete;
