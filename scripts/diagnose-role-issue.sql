-- Diagnostic script to identify why roles are being automatically disabled
-- Run this in Supabase SQL Editor to see what's happening

-- Step 1: Check current profile state
SELECT 
    'Current Profile State' as section,
    id,
    user_id,
    email,
    account_type,
    buyer_enabled,
    business_enabled,
    creator_enabled,
    investor_enabled,
    mentor_enabled,
    created_at,
    updated_at
FROM public.profiles 
WHERE email = 'jumatomosanya@gmail.com'  -- Replace with your email
ORDER BY updated_at DESC;

-- Step 2: Check for any CHECK constraints on the profiles table
SELECT 
    'Table Constraints' as section,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- Step 3: Check for any triggers on the profiles table
SELECT 
    'Table Triggers' as section,
    t.tgname as trigger_name,
    t.tgtype,
    p.proname as function_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.profiles'::regclass;

-- Step 4: Check for any functions that might be updating profiles
SELECT 
    'Functions that reference profiles' as section,
    p.proname as function_name,
    p.prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.prosrc ILIKE '%profiles%'
AND p.prosrc ILIKE '%business_enabled%'
ORDER BY p.proname;

-- Step 5: Check for any RLS policies that might be interfering
SELECT 
    'RLS Policies' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 6: Check if there are any database rules
SELECT 
    'Database Rules' as section,
    rulename,
    ev_type,
    ev_class,
    is_instead,
    ev_qual,
    ev_action
FROM pg_rewrite 
WHERE ev_class = 'public.profiles'::regclass;

-- Step 7: Check for any foreign key constraints that might cascade
SELECT 
    'Foreign Key Constraints' as section,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'profiles';

-- Step 8: Check for any views that might be interfering
SELECT 
    'Views referencing profiles' as section,
    v.viewname,
    v.definition
FROM pg_views v
WHERE v.definition ILIKE '%profiles%'
AND v.definition ILIKE '%business_enabled%';
