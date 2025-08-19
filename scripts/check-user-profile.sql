-- Check Specific User Profile
-- This will help identify what's missing in your profile

-- 1. Check your specific user profile
SELECT 
    'Your Profile Data:' as info
UNION ALL
SELECT 'User ID: ' || id
UNION ALL
SELECT 'Email: ' || email
UNION ALL
SELECT 'Created: ' || created_at::text
FROM auth.users 
WHERE email = 'ro.osemwengie@gmail.com';

-- 2. Check if you have a profile record
SELECT 
    'Profile Check:' as info
UNION ALL
SELECT 'Has Profile: ' || CASE WHEN p.id IS NOT NULL THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 'Profile ID: ' || COALESCE(p.id::text, 'NULL')
UNION ALL
SELECT 'First Name: ' || COALESCE(p.first_name, 'NULL')
UNION ALL
SELECT 'Last Name: ' || COALESCE(p.last_name, 'NULL')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'ro.osemwengie@gmail.com';

-- 3. Check all profile columns for your user
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check if there are any profiles at all
SELECT 
    'Total Profiles:' as info,
    COUNT(*) as count
FROM public.profiles;
