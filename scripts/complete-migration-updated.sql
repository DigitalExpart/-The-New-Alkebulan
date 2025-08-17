-- Complete Migration Script - Updated for Current Database Structure
-- This script handles both the name migration and column updates

-- ============================================================================
-- STEP 1: UPDATE MAIN PROFILES TABLE STRUCTURE
-- ============================================================================

-- Add new name columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Rename seller_enabled to business_enabled if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'seller_enabled') THEN
        ALTER TABLE public.profiles RENAME COLUMN seller_enabled TO business_enabled;
        RAISE NOTICE 'Renamed seller_enabled to business_enabled in profiles table';
    END IF;
END $$;

-- Migrate existing full_name data to first_name and last_name
UPDATE public.profiles 
SET 
    first_name = CASE 
        WHEN full_name IS NULL OR full_name = '' THEN 'User'
        WHEN full_name = 'User' THEN 'User'
        ELSE SPLIT_PART(TRIM(full_name), ' ', 1)
    END,
    last_name = CASE 
        WHEN full_name IS NULL OR full_name = '' THEN ''
        WHEN full_name = 'User' THEN ''
        WHEN POSITION(' ' IN TRIM(full_name)) = 0 THEN ''
        ELSE SUBSTRING(TRIM(full_name) FROM POSITION(' ' IN TRIM(full_name)) + 1)
    END
WHERE first_name IS NULL OR last_name IS NULL;

-- Set default values for any remaining NULL values
UPDATE public.profiles 
SET 
    first_name = COALESCE(first_name, 'User'),
    last_name = COALESCE(last_name, '')
WHERE first_name IS NULL OR last_name IS NULL;

-- Make first_name NOT NULL (last_name can remain nullable)
ALTER TABLE public.profiles 
ALTER COLUMN first_name SET NOT NULL;

-- ============================================================================
-- STEP 2: UPDATE PROFILES_BACKUP TABLE (IF IT EXISTS)
-- ============================================================================

-- Check if profiles_backup table exists and update it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'profiles_backup') THEN
        
        -- Add new name columns
        ALTER TABLE public.profiles_backup 
        ADD COLUMN IF NOT EXISTS first_name TEXT,
        ADD COLUMN IF NOT EXISTS last_name TEXT;
        
        -- Rename seller_enabled to business_enabled
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles_backup' AND column_name = 'seller_enabled') THEN
            ALTER TABLE public.profiles_backup RENAME COLUMN seller_enabled TO business_enabled;
            RAISE NOTICE 'Renamed seller_enabled to business_enabled in profiles_backup table';
        END IF;
        
        -- Migrate existing data
        UPDATE public.profiles_backup 
        SET 
            first_name = CASE 
                WHEN full_name IS NULL OR full_name = '' THEN 'User'
                WHEN full_name = 'User' THEN 'User'
                ELSE SPLIT_PART(TRIM(full_name), ' ', 1)
            END,
            last_name = CASE 
                WHEN full_name IS NULL OR full_name = '' THEN ''
                WHEN full_name = 'User' THEN ''
                WHEN POSITION(' ' IN TRIM(full_name)) = 0 THEN ''
                ELSE SUBSTRING(TRIM(full_name) FROM POSITION(' ' IN TRIM(full_name)) + 1)
            END
        WHERE first_name IS NULL OR last_name IS NULL;
        
        -- Set defaults
        UPDATE public.profiles_backup 
        SET 
            first_name = COALESCE(first_name, 'User'),
            last_name = COALESCE(last_name, '')
        WHERE first_name IS NULL OR last_name IS NULL;
        
        RAISE NOTICE 'Updated profiles_backup table structure';
    ELSE
        RAISE NOTICE 'profiles_backup table does not exist, skipping';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better performance on main profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);

-- ============================================================================
-- STEP 4: UPDATE THE NEW USER TRIGGER FUNCTION
-- ============================================================================

-- Update the function to handle new user signups with first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        user_id,
        first_name,
        last_name,
        username,
        email,
        country,
        account_type,
        buyer_enabled,
        business_enabled,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::text, 1, 8)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'country', 'Unknown'),
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'buyer'),
        CASE WHEN COALESCE(NEW.raw_user_meta_data->>'account_type', 'buyer') = 'business' THEN FALSE ELSE TRUE END,
        CASE WHEN COALESCE(NEW.raw_user_meta_data->>'account_type', 'buyer') = 'business' THEN TRUE ELSE FALSE END,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: VERIFY MIGRATION SUCCESS
-- ============================================================================

-- Show migration results for main profiles table
SELECT 
    'Main profiles table migration completed!' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN first_name IS NOT NULL THEN 1 END) as profiles_with_first_name,
    COUNT(CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 1 END) as profiles_with_last_name,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as profiles_with_old_full_name
FROM public.profiles;

-- Show migration results for profiles_backup table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'profiles_backup') THEN
        RAISE NOTICE 'profiles_backup table exists - checking migration status...';
        
        -- This will show the results in the notice
        PERFORM COUNT(*) FROM public.profiles_backup;
        PERFORM COUNT(CASE WHEN first_name IS NOT NULL THEN 1 END) FROM public.profiles_backup;
        PERFORM COUNT(CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 1 END) FROM public.profiles_backup;
    END IF;
END $$;

-- Show sample of migrated data for verification
SELECT 
    'Main profiles table sample:' as table_name,
    id,
    first_name,
    last_name,
    full_name as old_full_name,
    CASE 
        WHEN full_name IS NOT NULL THEN 'Migrated'
        ELSE 'New'
    END as migration_status
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Show current table structure
SELECT 
    'Current profiles table structure:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- ============================================================================
-- STEP 6: CLEANUP OPTIONS (UNCOMMENT WHEN READY)
-- ============================================================================

-- After confirming the migration was successful, you can remove old columns:
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

-- If you want to drop the backup table (after confirming it's no longer needed):
-- DROP TABLE IF EXISTS public.profiles_backup;

-- Note: Keep the old columns for now to ensure data integrity
-- You can remove them later after confirming everything works correctly
