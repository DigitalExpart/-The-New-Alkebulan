-- 🔧 STEP-BY-STEP FIX FOR SELLER TO BUSINESS MIGRATION
-- Run each section one at a time in your Supabase SQL Editor
-- Stop and check results after each section

-- ========================================
-- STEP 1: Check current state
-- ========================================
-- Run this first to see what we're working with
SELECT 
    'Current state' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN seller_enabled = true THEN 1 END) as seller_users,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_users
FROM profiles;

-- ========================================
-- STEP 2: Fix account_type constraint
-- ========================================
-- This fixes the "invalid input value for enum" error
-- Drop the old constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_account_type_check;

-- Add new constraint that allows 'business'
ALTER TABLE profiles 
ADD CONSTRAINT profiles_account_type_check 
CHECK (account_type IN ('buyer', 'business', 'investor', 'mentor', 'creator', 'member'));

-- ========================================
-- STEP 3: Update account_type values
-- ========================================
-- Change any 'seller' values to 'business'
UPDATE profiles 
SET account_type = 'business' 
WHERE account_type = 'seller';

-- ========================================
-- STEP 4: Copy data to business_enabled
-- ========================================
-- Copy data from seller_enabled to business_enabled
UPDATE profiles 
SET business_enabled = seller_enabled 
WHERE seller_enabled IS NOT NULL;

-- ========================================
-- STEP 5: Verify the changes
-- ========================================
-- Check that everything worked
SELECT 
    'After migration' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN business_enabled = true THEN 1 END) as business_users,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_users,
    COUNT(CASE WHEN account_type = 'business' THEN 1 END) as business_accounts
FROM profiles;

-- ========================================
-- STEP 6: Clean up (optional)
-- ========================================
-- Only run this after confirming everything works
-- ALTER TABLE profiles DROP COLUMN seller_enabled;
