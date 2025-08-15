-- 🔧 UPDATE ALL SELLER/SELLING REFERENCES TO BUSINESS
-- This script will update your database schema and data to use "business" instead of "seller"

-- ⚠️ IMPORTANT: BACKUP YOUR DATABASE BEFORE RUNNING THIS SCRIPT
-- Run this in your Supabase SQL Editor

-- ========================================
-- 1. UPDATE COLUMN NAMES IN PROFILES TABLE
-- ========================================

-- First, let's check what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE '%seller%';

-- Update seller_enabled to business_enabled
ALTER TABLE profiles 
RENAME COLUMN seller_enabled TO business_enabled;

-- If you have other seller-related columns, update them too
-- ALTER TABLE profiles RENAME COLUMN seller_verified TO business_verified;
-- ALTER TABLE profiles RENAME COLUMN seller_level TO business_level;

-- ========================================
-- 2. UPDATE TABLE NAMES
-- ========================================

-- Rename seller_settings table to business_settings
ALTER TABLE seller_settings 
RENAME TO business_settings;

-- Rename any other seller-related tables
-- ALTER TABLE seller_products RENAME TO business_products;
-- ALTER TABLE seller_orders RENAME TO business_orders;

-- ========================================
-- 3. UPDATE DATA VALUES IN COLUMNS
-- ========================================

-- Update any text values from 'seller' to 'business'
UPDATE profiles 
SET role = 'business' 
WHERE role = 'seller';

UPDATE profiles 
SET account_type = 'business' 
WHERE account_type = 'seller';

-- Update any other tables that might have seller references
-- UPDATE business_settings 
-- SET setting_value = REPLACE(setting_value, 'seller', 'business')
-- WHERE setting_value LIKE '%seller%';

-- ========================================
-- 4. UPDATE RLS POLICIES
-- ========================================

-- Drop existing seller-related policies
DROP POLICY IF EXISTS "Users can view seller profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update seller settings" ON business_settings;

-- Create new business-related policies
CREATE POLICY "Users can view business profiles" ON profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update business settings" ON business_settings
FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- 5. UPDATE FUNCTIONS AND TRIGGERS
-- ========================================

-- If you have any functions with seller in the name, update them
-- Example:
-- CREATE OR REPLACE FUNCTION update_business_status()
-- AS $$
-- BEGIN
--   -- Your business logic here
-- END;
-- $$ LANGUAGE plpgsql;

-- ========================================
-- 6. VERIFY CHANGES
-- ========================================

-- Check that columns were renamed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE '%business%';

-- Check that tables were renamed
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%business%';

-- Check data updates
SELECT id, username, business_enabled, role, account_type 
FROM profiles 
LIMIT 10;

-- ========================================
-- 7. UPDATE ANY REMAINING REFERENCES
-- ========================================

-- Search for any remaining seller references
SELECT 
    schemaname,
    tablename,
    columnname,
    'Column contains seller reference' as issue
FROM pg_tables pt
JOIN information_schema.columns ic ON pt.tablename = ic.table_name
WHERE ic.column_name LIKE '%seller%'
   OR ic.table_name LIKE '%seller%';

-- ========================================
-- 8. CLEANUP AND FINAL VERIFICATION
-- ========================================

-- Refresh your application's view of the database
-- This ensures all changes are visible to your app

-- Final verification query
SELECT 
    'Database updated successfully!' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN business_enabled = true THEN 1 END) as business_users,
    COUNT(CASE WHEN business_enabled = false THEN 1 END) as buyer_users
FROM profiles;
