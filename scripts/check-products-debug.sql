-- Diagnostic script to check products table and identify issues
-- Run this in your Supabase SQL editor to debug the products display issue

-- 1. Check if products table exists and has data
SELECT '=== PRODUCTS TABLE CHECK ===' as section;

SELECT 
  'products' as table_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_products,
  COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_products
FROM public.products;

-- 2. Show all products with their details
SELECT '=== ALL PRODUCTS DETAILS ===' as section;

SELECT 
  id,
  name,
  status,
  category,
  subcategory,
  actual_price,
  sales_price,
  inventory,
  has_variants,
  user_id,
  created_at,
  updated_at
FROM public.products
ORDER BY created_at DESC;

-- 3. Check if there are any products with specific statuses
SELECT '=== PRODUCTS BY STATUS ===' as section;

SELECT 
  status,
  COUNT(*) as count,
  STRING_AGG(name, ', ') as product_names
FROM public.products
GROUP BY status;

-- 4. Check user profiles to see if products are linked to valid users
SELECT '=== USER-PRODUCT RELATIONSHIP ===' as section;

SELECT 
  p.id as product_id,
  p.name as product_name,
  p.status as product_status,
  p.user_id,
  pr.first_name,
  pr.last_name,
  pr.business_enabled
FROM public.products p
LEFT JOIN public.profiles pr ON p.user_id = pr.id
ORDER BY p.created_at DESC;

-- 5. Check if RLS policies are blocking access
SELECT '=== RLS POLICY CHECK ===' as section;

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
WHERE tablename = 'products';

-- 6. Check if the current user can see products
SELECT '=== CURRENT USER ACCESS CHECK ===' as section;

-- This will show what the current authenticated user can see
SELECT 
  'Current user can see products' as check_type,
  COUNT(*) as visible_products
FROM public.products 
WHERE status = 'active';

-- 7. Check for any constraint violations or errors
SELECT '=== CONSTRAINT CHECK ===' as section;

SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.products'::regclass;

-- 8. Check if there are any triggers that might be affecting the data
SELECT '=== TRIGGERS CHECK ===' as section;

SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'products';

-- 9. Test a simple insert to see if there are any issues
SELECT '=== TEST INSERT CHECK ===' as section;

-- This will help identify if there are any issues with the table structure
SELECT 
  'Table structure is valid' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. Summary of findings
SELECT '=== SUMMARY ===' as section;

SELECT 
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.products) THEN 'Products table has data'
    ELSE 'Products table is empty'
  END as table_status,
  
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.products WHERE status = 'active') THEN 'Active products found'
    ELSE 'No active products found'
  END as active_status,
  
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'products') THEN 'RLS policies exist'
    ELSE 'No RLS policies found'
  END as rls_status;
