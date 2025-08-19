-- Check Profiles Actual Structure
-- This will show us exactly what columns exist

-- Step 1: Check what columns are in the profiles table
SELECT 
    attname as column_name,
    format_type(atttypid, atttypmod) as data_type
FROM pg_attribute 
WHERE attrelid = 'public.profiles'::regclass
AND attnum > 0 
AND NOT attisdropped
ORDER BY attnum;

-- Step 2: Show a sample profile record
SELECT * FROM public.profiles LIMIT 1;

-- Step 3: Check if we can find your profile by user_id
SELECT 
    'Profile Search:' as info
UNION ALL
SELECT 'Can find profile: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2'
    ) THEN 'YES' ELSE 'NO' END;
