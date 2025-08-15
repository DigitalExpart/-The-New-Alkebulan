-- 🔧 FIX CONSTRAINT VIOLATION STEP BY STEP
-- Run each section one at a time in your Supabase SQL Editor

-- ========================================
-- STEP 1: Check what values currently exist
-- ========================================
-- This will show you exactly what's in your database
SELECT DISTINCT account_type, COUNT(*) as count
FROM profiles 
GROUP BY account_type
ORDER BY count DESC;

-- Also check the role column
SELECT DISTINCT role, COUNT(*) as count
FROM profiles 
GROUP BY role
ORDER BY count DESC;

-- ========================================
-- STEP 2: Check for invalid values
-- ========================================
-- Look for any rows that might cause constraint violations
SELECT id, username, account_type, role, business_enabled, buyer_enabled
FROM profiles 
WHERE account_type NOT IN ('buyer', 'business', 'investor', 'mentor', 'creator', 'member')
   OR account_type IS NULL
LIMIT 10;

-- ========================================
-- STEP 3: Fix NULL values first
-- ========================================
-- Set NULL account_type to 'buyer' (default)
UPDATE profiles 
SET account_type = 'buyer' 
WHERE account_type IS NULL;

-- ========================================
-- STEP 4: Fix any 'seller' values
-- ========================================
-- Change 'seller' to 'business'
UPDATE profiles 
SET account_type = 'business' 
WHERE account_type = 'seller';

-- ========================================
-- STEP 5: Check for other invalid values
-- ========================================
-- Look for any other unexpected values
SELECT DISTINCT account_type, COUNT(*) as count
FROM profiles 
GROUP BY account_type
ORDER BY count DESC;

-- ========================================
-- STEP 6: Now try to add the constraint
-- ========================================
-- First drop the old constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_account_type_check;

-- Now add the new constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_account_type_check 
CHECK (account_type IN ('buyer', 'business', 'investor', 'mentor', 'creator', 'member'));

-- ========================================
-- STEP 7: Verify the constraint works
-- ========================================
-- Test that the constraint is working
SELECT 'Constraint test' as info, COUNT(*) as total_profiles
FROM profiles 
WHERE account_type IN ('buyer', 'business', 'investor', 'mentor', 'creator', 'member');

-- ========================================
-- STEP 8: Final verification
-- ========================================
-- Show the final state
SELECT 
    'Final state' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN account_type = 'business' THEN 1 END) as business_accounts,
    COUNT(CASE WHEN account_type = 'buyer' THEN 1 END) as buyer_accounts,
    COUNT(CASE WHEN business_enabled = true THEN 1 END) as business_enabled_users,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_enabled_users
FROM profiles;
