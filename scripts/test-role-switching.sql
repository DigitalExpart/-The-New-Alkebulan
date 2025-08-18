-- Test script to manually test role switching
-- Run this to see what happens when we update account_type

-- Step 1: Check current state
SELECT 
    'BEFORE TEST - Current state' as section,
    id,
    user_id,
    email,
    account_type,
    buyer_enabled,
    business_enabled,
    creator_enabled,
    investor_enabled,
    mentor_enabled,
    updated_at
FROM public.profiles 
WHERE email = 'jumatomosanya@gmail.com';  -- Replace with your email

-- Step 2: Test updating only account_type (this is what the role switcher should do)
UPDATE public.profiles 
SET account_type = 'buyer', updated_at = NOW()
WHERE email = 'jumatomosanya@gmail.com';  -- Replace with your email

-- Step 3: Check state after update
SELECT 
    'AFTER TEST - State after account_type update' as section,
    id,
    user_id,
    email,
    account_type,
    buyer_enabled,
    business_enabled,
    creator_enabled,
    investor_enabled,
    mentor_enabled,
    updated_at
FROM public.profiles 
WHERE email = 'jumatomosanya@gmail.com';  -- Replace with your email

-- Step 4: Check if any triggers fired
SELECT 
    'Triggers that might have fired' as section,
    t.tgname as trigger_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.profiles'::regclass
AND t.tgtype & 66 != 0;  -- UPDATE triggers
