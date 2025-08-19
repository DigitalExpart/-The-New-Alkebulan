-- Fix Profile - Final Working Version
-- This will create your profile using the correct column names

-- Step 1: Check what columns exist in profiles table
SELECT 
    attname as column_name,
    format_type(atttypid, atttypmod) as data_type
FROM pg_attribute 
WHERE attrelid = 'public.profiles'::regclass
AND attnum > 0 
AND NOT attisdropped
ORDER BY attnum;

-- Step 2: Show a sample profile to see the structure
SELECT * FROM public.profiles LIMIT 1;

-- Step 3: Check if you have a profile
SELECT 
    'Profile Check:' as info
UNION ALL
SELECT 'Has Profile: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = 'bd55f9a6-ea51-4c3a-aa72-00a1697e79d2'
    ) THEN 'YES' ELSE 'NO' END;

-- Step 4: Create your profile using the correct structure
INSERT INTO public.profiles (
    id,
    full_name,
    first_name,
    last_name,
    email,
    created_at,
    updated_at
) VALUES (
    'bd55f9a6-ea51-4c3a-aa72-00a1697e79d2', -- Your Profile ID from dashboard
    'Roger Osemwengie', -- Full name
    'Roger', -- First name
    'Osemwengie', -- Last name
    'ro.osemwengie@gmail.com',
    NOW(),
    NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Step 5: Verify your profile was created
SELECT 
    'Profile Created:' as info
UNION ALL
SELECT 'ID: ' || id
UNION ALL
SELECT 'Name: ' || COALESCE(first_name, 'NULL') || ' ' || COALESCE(last_name, 'NULL')
UNION ALL
SELECT 'Email: ' || COALESCE(email, 'NULL')
FROM public.profiles 
WHERE id = 'bd55f9a6-ea51-4c3a-aa72-00a1697e79d2';
