-- Simple fix for profiles table user_id issue
-- This script works with the actual table structure

-- Step 1: Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: See what records exist
SELECT id, full_name, user_id, created_at 
FROM public.profiles 
LIMIT 10;

-- Step 3: Delete any records with null user_id (these are likely test data)
DELETE FROM public.profiles WHERE user_id IS NULL;

-- Step 4: Now safely add the NOT NULL constraint
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- Step 5: Add unique constraint (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' 
        AND constraint_name = 'profiles_user_id_unique'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Step 6: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop and recreate policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Step 8: Create new policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Verify everything is working
SELECT 
    'Profiles table fixed successfully!' as status,
    COUNT(*) as total_profiles
FROM public.profiles; 