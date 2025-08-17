-- Add First Name and Last Name Columns to Profiles Table
-- This script migrates from full_name to separate first_name and last_name fields

-- Add new columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Migrate existing full_name data to first_name and last_name
UPDATE public.profiles 
SET 
    first_name = CASE 
        WHEN full_name IS NULL OR full_name = '' THEN 'User'
        ELSE SPLIT_PART(full_name, ' ', 1)
    END,
    last_name = CASE 
        WHEN full_name IS NULL OR full_name = '' THEN ''
        WHEN POSITION(' ' IN full_name) = 0 THEN ''
        ELSE SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);

-- Show migration results
SELECT 
    'Migration completed successfully!' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN first_name IS NOT NULL THEN 1 END) as profiles_with_first_name,
    COUNT(CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 1 END) as profiles_with_last_name
FROM public.profiles;
