-- Add missing role columns to profiles table
-- This script adds the creator, investor, and mentor role columns

-- 1. Add missing role columns if they don't exist
DO $$ 
BEGIN
    -- Add creator_enabled column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'creator_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN creator_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added creator_enabled column';
    ELSE
        RAISE NOTICE 'creator_enabled column already exists';
    END IF;
    
    -- Add investor_enabled column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'investor_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN investor_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added investor_enabled column';
    ELSE
        RAISE NOTICE 'investor_enabled column already exists';
    END IF;
    
    -- Add mentor_enabled column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'mentor_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN mentor_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added mentor_enabled column';
    ELSE
        RAISE NOTICE 'mentor_enabled column already exists';
    END IF;
END $$;

-- 2. Update existing profiles to have at least buyer role enabled
UPDATE public.profiles 
SET buyer_enabled = true 
WHERE buyer_enabled IS NULL OR buyer_enabled = false;

-- 3. Show current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('buyer_enabled', 'business_enabled', 'creator_enabled', 'investor_enabled', 'mentor_enabled')
ORDER BY column_name;

-- 4. Show current role status for all profiles
SELECT 
    id,
    user_id,
    full_name,
    email,
    buyer_enabled,
    business_enabled,
    creator_enabled,
    investor_enabled,
    mentor_enabled,
    account_type
FROM public.profiles 
ORDER BY created_at DESC;

-- 5. Success message
SELECT 'Role columns added successfully! Check the results above.' as result;
