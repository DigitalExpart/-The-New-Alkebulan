-- Add user_id column to profiles table
-- This script first adds the column, then sets up constraints

-- Step 1: Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Add the user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN user_id UUID;
        RAISE NOTICE 'Added user_id column to profiles table';
    ELSE
        RAISE NOTICE 'user_id column already exists';
    END IF;
END $$;

-- Step 3: Check what records exist (now that user_id column exists)
SELECT id, full_name, user_id, created_at 
FROM public.profiles 
LIMIT 10;

-- Step 4: Delete any records with null user_id (these are orphaned)
DELETE FROM public.profiles WHERE user_id IS NULL;

-- Step 5: Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' 
        AND constraint_name = 'profiles_user_id_fkey'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint';
    END IF;
END $$;

-- Step 6: Set NOT NULL constraint
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- Step 7: Add unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' 
        AND constraint_name = 'profiles_user_id_unique'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint';
    END IF;
END $$;

-- Step 8: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 9: Drop and recreate policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Step 10: Create new policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Step 11: Verify everything is working
SELECT 
    'Profiles table setup complete!' as status,
    COUNT(*) as total_profiles
FROM public.profiles;

-- Step 12: Show final table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position; 