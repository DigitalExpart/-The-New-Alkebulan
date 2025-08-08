-- Fix id column to auto-generate UUIDs
-- This script ensures the id column has a proper default value

-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Set default value for id column to auto-generate UUID
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- If there are any existing records with null id, update them
UPDATE public.profiles SET id = gen_random_uuid() WHERE id IS NULL;

-- Verify the fix
SELECT 
    'ID column fixed successfully!' as status,
    COUNT(*) as total_profiles,
    COUNT(id) as profiles_with_id
FROM public.profiles;

-- Show updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position; 