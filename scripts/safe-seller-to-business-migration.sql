-- 🔧 SAFE MIGRATION: SELLER TO BUSINESS
-- Run this script step by step in your Supabase SQL Editor
-- Stop and verify after each section

-- ========================================
-- STEP 1: BACKUP AND VERIFICATION
-- ========================================

-- First, let's see what we're working with
SELECT 
    'Current database state' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN seller_enabled = true THEN 1 END) as seller_users,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_users
FROM profiles;

-- Check for seller-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%seller%';

-- Check for seller-related columns
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name LIKE '%seller%'
ORDER BY table_name, column_name;

-- ========================================
-- STEP 2: CREATE BACKUP TABLES
-- ========================================

-- Create backup of profiles table
CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- Create backup of seller_settings table (if it exists)
-- CREATE TABLE seller_settings_backup AS SELECT * FROM seller_settings;

-- Verify backups
SELECT 'Backup created' as status, COUNT(*) as rows FROM profiles_backup;
-- SELECT 'Settings backup created' as status, COUNT(*) as rows FROM seller_settings_backup;

-- ========================================
-- STEP 3: ADD NEW BUSINESS COLUMNS
-- ========================================

-- Add new business_enabled column alongside existing seller_enabled
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_enabled BOOLEAN DEFAULT false;

-- Copy data from seller_enabled to business_enabled
UPDATE profiles 
SET business_enabled = seller_enabled 
WHERE seller_enabled IS NOT NULL;

-- Verify the copy worked
SELECT 
    'Data copied' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN seller_enabled = true THEN 1 END) as old_seller_count,
    COUNT(CASE WHEN business_enabled = true THEN 1 END) as new_business_count
FROM profiles;

-- ========================================
-- STEP 4: RENAME TABLES
-- ========================================

-- Rename seller_settings to business_settings
-- (Uncomment when ready)
-- ALTER TABLE seller_settings RENAME TO business_settings;

-- ========================================
-- STEP 5: UPDATE APPLICATION CODE
-- ========================================

-- At this point, update your application code to use:
-- - business_enabled instead of seller_enabled
-- - business_settings instead of seller_settings

-- ========================================
-- STEP 6: VERIFY APPLICATION WORKS
-- ========================================

-- Test that your app still works with the new columns
-- If everything is working, proceed to next step

-- ========================================
-- STEP 7: REMOVE OLD COLUMNS (OPTIONAL)
-- ========================================

-- Only run this after confirming everything works
-- ALTER TABLE profiles DROP COLUMN seller_enabled;

-- ========================================
-- STEP 8: FINAL VERIFICATION
-- ========================================

-- Check final state
SELECT 
    'Migration completed' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN business_enabled = true THEN 1 END) as business_users,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_users
FROM profiles;

-- Check for any remaining seller references
SELECT 
    'Remaining seller references' as info,
    COUNT(*) as count
FROM information_schema.columns 
WHERE column_name LIKE '%seller%';

-- ========================================
-- ROLLBACK INSTRUCTIONS (IF NEEDED)
-- ========================================

-- If something goes wrong, you can rollback:
-- DROP TABLE profiles;
-- ALTER TABLE profiles_backup RENAME TO profiles;
-- DROP TABLE profiles_backup;
