-- Check if there's a trigger that automatically updates role fields when account_type changes
-- This could be the root cause of roles being automatically disabled

-- Check for any triggers that fire on UPDATE of account_type
SELECT 
    'Triggers on UPDATE' as section,
    t.tgname as trigger_name,
    t.tgtype,
    p.proname as function_name,
    p.prosrc as function_source,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.profiles'::regclass
AND t.tgtype & 66 != 0  -- Check for UPDATE triggers (66 = 2 + 64)
AND p.prosrc ILIKE '%account_type%';

-- Check for any functions that might be called by triggers
SELECT 
    'Functions that might update roles' as section,
    p.proname as function_name,
    p.prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND (
    p.prosrc ILIKE '%account_type%' 
    AND p.prosrc ILIKE '%business_enabled%'
    OR p.prosrc ILIKE '%account_type%' 
    AND p.prosrc ILIKE '%buyer_enabled%'
)
ORDER BY p.proname;

-- Check for any database rules that might be interfering
SELECT 
    'Database Rules' as section,
    r.rulename,
    r.ev_type,
    r.ev_class,
    r.is_instead,
    r.ev_qual,
    r.ev_action
FROM pg_rewrite r
WHERE r.ev_class = 'public.profiles'::regclass
AND r.ev_action::text ILIKE '%account_type%';

-- Check if there are any stored procedures or functions that might be called automatically
SELECT 
    'Auto-called functions' as section,
    p.proname as function_name,
    p.prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.prosrc ILIKE '%profiles%'
AND p.prosrc ILIKE '%UPDATE%'
AND p.prosrc ILIKE '%business_enabled%';

-- Check for any constraints that might be causing cascading updates
SELECT 
    'Constraints that might cascade' as section,
    c.conname as constraint_name,
    c.contype as constraint_type,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
WHERE c.conrelid = 'public.profiles'::regclass
AND c.contype IN ('f', 'c')  -- Foreign key or check constraints
AND pg_get_constraintdef(c.oid) ILIKE '%account_type%';
