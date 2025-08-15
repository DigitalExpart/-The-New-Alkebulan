-- 🔧 FIXED MIGRATION: SELLER TO BUSINESS
-- This script handles the specific errors encountered in the previous migration
-- Run this in your Supabase SQL Editor

-- ========================================
-- STEP 1: CHECK CURRENT STATE
-- ========================================

-- Check what columns currently exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('seller_enabled', 'business_enabled', 'role', 'account_type')
ORDER BY column_name;

-- Check table constraints
SELECT conname, contype, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass
AND conname LIKE '%account_type%';

-- ========================================
-- STEP 2: FIX EXISTING ISSUES
-- ========================================

-- First, let's see what values exist in the role and account_type columns
SELECT DISTINCT role, account_type, COUNT(*) as count
FROM profiles 
GROUP BY role, account_type;

-- ========================================
-- STEP 3: UPDATE ACCOUNT_TYPE CONSTRAINT (IF NEEDED)
-- ========================================

-- Drop the existing constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_account_type_check' 
        AND conrelid = 'profiles'::regclass
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_account_type_check;
    END IF;
END $$;

-- Create new constraint that allows 'business'
ALTER TABLE profiles 
ADD CONSTRAINT profiles_account_type_check 
CHECK (account_type IN ('buyer', 'business', 'investor', 'mentor', 'creator', 'member'));

-- ========================================
-- STEP 4: HANDLE BUSINESS_ENABLED COLUMN
-- ========================================

-- Check if business_enabled column exists and has data
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'business_enabled'
    ) THEN
        -- Column exists, check if it has data
        IF EXISTS (
            SELECT 1 FROM profiles 
            WHERE business_enabled IS NOT NULL
        ) THEN
            RAISE NOTICE 'business_enabled column exists and has data';
        ELSE
            RAISE NOTICE 'business_enabled column exists but is empty';
        END IF;
    ELSE
        -- Column doesn't exist, create it
        ALTER TABLE profiles ADD COLUMN business_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Created business_enabled column';
    END IF;
END $$;

-- ========================================
-- STEP 5: UPDATE DATA VALUES
-- ========================================

-- Update account_type from 'seller' to 'business' (if any exist)
UPDATE profiles 
SET account_type = 'business' 
WHERE account_type = 'seller';

-- Copy data from seller_enabled to business_enabled (if seller_enabled exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'seller_enabled'
    ) THEN
        -- Copy data from seller_enabled to business_enabled
        UPDATE profiles 
        SET business_enabled = seller_enabled 
        WHERE seller_enabled IS NOT NULL;
        
        RAISE NOTICE 'Copied data from seller_enabled to business_enabled';
    END IF;
END $$;

-- ========================================
-- STEP 6: VERIFY CHANGES
-- ========================================

-- Check the current state after updates
SELECT 
    'Data verification' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN business_enabled = true THEN 1 END) as business_users,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_users,
    COUNT(CASE WHEN account_type = 'business' THEN 1 END) as business_accounts,
    COUNT(CASE WHEN account_type = 'buyer' THEN 1 END) as buyer_accounts
FROM profiles;

-- Check for any remaining 'seller' references
SELECT 
    'Remaining seller references' as info,
    COUNT(*) as count
FROM profiles 
WHERE account_type = 'seller' OR role = 'seller';

-- ========================================
-- STEP 7: CLEANUP (OPTIONAL)
-- ========================================

-- Only run this after confirming everything works correctly
-- Remove seller_enabled column if it exists and business_enabled is working
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'seller_enabled'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'business_enabled'
    ) THEN
        -- Check if data was copied successfully
        IF NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE seller_enabled IS NOT NULL AND business_enabled IS NULL
        ) THEN
            -- Data copied successfully, safe to remove seller_enabled
            ALTER TABLE profiles DROP COLUMN seller_enabled;
            RAISE NOTICE 'Removed seller_enabled column (data safely copied)';
        ELSE
            RAISE NOTICE 'seller_enabled column still has data, not removing yet';
        END IF;
    END IF;
END $$;

-- ========================================
-- STEP 8: FINAL VERIFICATION
-- ========================================

-- Final state check
SELECT 
    'Migration completed' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN business_enabled = true THEN 1 END) as business_users,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_users
FROM profiles;

-- Show current column structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('business_enabled', 'buyer_enabled', 'account_type', 'role')
ORDER BY column_name;
