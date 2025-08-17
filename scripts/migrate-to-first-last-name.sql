-- Complete Migration from full_name to first_name and last_name
-- This script updates the Supabase profiles table to match the new signup form structure

-- Step 1: Add new columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Step 2: Migrate existing full_name data to first_name and last_name
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

-- Step 3: Set default values for any remaining NULL values
UPDATE public.profiles 
SET 
    first_name = COALESCE(first_name, 'User'),
    last_name = COALESCE(last_name, '')
WHERE first_name IS NULL OR last_name IS NULL;

-- Step 4: Make first_name NOT NULL (last_name can remain nullable)
ALTER TABLE public.profiles 
ALTER COLUMN first_name SET NOT NULL;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);

-- Step 6: Verify the migration was successful
SELECT 
    'Migration completed successfully!' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN first_name IS NOT NULL THEN 1 END) as profiles_with_first_name,
    COUNT(CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 1 END) as profiles_with_last_name,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as profiles_with_old_full_name
FROM public.profiles;

-- Step 7: Show sample of migrated data for verification
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

-- Step 8: Optional - Remove the old full_name column (uncomment when ready)
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

-- Note: Keep the full_name column for now to ensure data integrity
-- You can remove it later after confirming the migration was successful
