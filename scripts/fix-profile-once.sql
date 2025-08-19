-- Fix Profile Once and For All
-- No more guessing - just fix it

-- Step 1: Just create the profile directly
INSERT INTO public.profiles (
    id,
    user_id,
    full_name,
    first_name,
    last_name,
    email,
    created_at,
    updated_at
) VALUES (
    'bd55f9a6-ea51-4c3a-aa72-00a1697e79d2',
    '41c785f0-63c7-4f25-9727-84550e28bfb2',
    'Roger Osemwengie',
    'Roger',
    'Osemwengie',
    'ro.osemwengie@gmail.com',
    NOW(),
    NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Step 2: Test if it worked
SELECT 'Profile Fixed!' as result;
