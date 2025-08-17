-- Complete Migration from full_name to first_name and last_name
-- Run this in your Supabase SQL Editor to complete the migration

-- ============================================================================
-- STEP 1: ADD NEW COLUMNS AND MIGRATE DATA
-- ============================================================================

-- Add new columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

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
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);

-- ============================================================================
-- STEP 3: UPDATE THE NEW USER TRIGGER FUNCTION
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
-- STEP 4: VERIFY MIGRATION SUCCESS
-- ============================================================================

-- Show migration results
SELECT 
    'Migration completed successfully!' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN first_name IS NOT NULL THEN 1 END) as profiles_with_first_name,
    COUNT(CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 1 END) as profiles_with_last_name,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as profiles_with_old_full_name
FROM public.profiles;

-- Show sample of migrated data for verification
SELECT 
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
LIMIT 10;

-- ============================================================================
-- STEP 5: OPTIONAL - REMOVE OLD COLUMN (UNCOMMENT WHEN READY)
-- ============================================================================

-- After confirming the migration was successful, you can remove the old column:
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

-- ============================================================================
-- STEP 6: VERIFY TABLE STRUCTURE
-- ============================================================================

-- Show final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Note: Keep the full_name column for now to ensure data integrity
-- You can remove it later after confirming the migration was successful
-- and all your application code is working correctly with first_name and last_name
