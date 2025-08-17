-- Comprehensive Fix for Profiles Table Schema
-- This script fixes the seller_enabled vs business_enabled issue and adds all missing columns

-- 1. First, let's check what columns currently exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Add missing role management columns
DO $$ 
BEGIN
    -- Add buyer_enabled column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'buyer_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN buyer_enabled BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added buyer_enabled column with default value true';
    ELSE
        RAISE NOTICE 'buyer_enabled column already exists';
    END IF;
    
    -- Add business_enabled column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN business_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added business_enabled column with default value false';
    ELSE
        RAISE NOTICE 'business_enabled column already exists';
    END IF;
    
    -- Add creator_enabled column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'creator_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN creator_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added creator_enabled column with default value false';
    ELSE
        RAISE NOTICE 'creator_enabled column already exists';
    END IF;
    
    -- Add investor_enabled column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'investor_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN investor_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added investor_enabled column with default value false';
    ELSE
        RAISE NOTICE 'investor_enabled column already exists';
    END IF;
    
    -- Add mentor_enabled column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'mentor_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN mentor_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added mentor_enabled column with default value false';
    ELSE
        RAISE NOTICE 'mentor_enabled column already exists';
    END IF;
    
    -- Add account_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'account_type') THEN
        ALTER TABLE public.profiles ADD COLUMN account_type TEXT DEFAULT 'buyer';
        RAISE NOTICE 'Added account_type column with default value buyer';
    ELSE
        RAISE NOTICE 'account_type column already exists';
    END IF;
END $$;

-- 3. Add other missing profile columns
DO $$ 
BEGIN
    -- Add language_preference column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'language_preference') THEN
        ALTER TABLE public.profiles ADD COLUMN language_preference TEXT[] DEFAULT ARRAY['English'];
        RAISE NOTICE 'Added language_preference column with default value';
    ELSE
        RAISE NOTICE 'language_preference column already exists';
    END IF;
    
    -- Add region column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'region') THEN
        ALTER TABLE public.profiles ADD COLUMN region TEXT;
        RAISE NOTICE 'Added region column';
    ELSE
        RAISE NOTICE 'region column already exists';
    END IF;
    
    -- Add gender column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE public.profiles ADD COLUMN gender TEXT;
        RAISE NOTICE 'Added gender column';
    ELSE
        RAISE NOTICE 'gender column already exists';
    END IF;
    
    -- Add place_of_birth column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'place_of_birth') THEN
        ALTER TABLE public.profiles ADD COLUMN place_of_birth TEXT;
        RAISE NOTICE 'Added place_of_birth column';
    ELSE
        RAISE NOTICE 'place_of_birth column already exists';
    END IF;
    
    -- Add date_of_birth column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'date_of_birth') THEN
        ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE;
        RAISE NOTICE 'Added date_of_birth column';
    ELSE
        RAISE NOTICE 'date_of_birth column already exists';
    END IF;
    
    -- Add relationship_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'relationship_status') THEN
        ALTER TABLE public.profiles ADD COLUMN relationship_status TEXT;
        RAISE NOTICE 'Added relationship_status column';
    ELSE
        RAISE NOTICE 'relationship_status column already exists';
    END IF;
    
    -- Add family_members column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'family_members') THEN
        ALTER TABLE public.profiles ADD COLUMN family_members TEXT[];
        RAISE NOTICE 'Added family_members column';
    ELSE
        RAISE NOTICE 'family_members column already exists';
    END IF;
    
    -- Add work_experience column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'work_experience') THEN
        ALTER TABLE public.profiles ADD COLUMN work_experience TEXT[];
        RAISE NOTICE 'Added work_experience column';
    ELSE
        RAISE NOTICE 'work_experience column already exists';
    END IF;
END $$;

-- 4. Handle the seller_enabled to business_enabled migration
DO $$ 
BEGIN
    -- If seller_enabled column exists, migrate data to business_enabled
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'seller_enabled') THEN
        -- Update business_enabled based on seller_enabled values
        UPDATE public.profiles 
        SET business_enabled = seller_enabled 
        WHERE business_enabled IS NULL;
        
        RAISE NOTICE 'Migrated seller_enabled data to business_enabled';
        
        -- Drop the old seller_enabled column
        ALTER TABLE public.profiles DROP COLUMN seller_enabled;
        RAISE NOTICE 'Dropped old seller_enabled column';
    ELSE
        RAISE NOTICE 'seller_enabled column does not exist, no migration needed';
    END IF;
END $$;

-- 5. Update existing profiles to have proper default values
UPDATE public.profiles 
SET 
    buyer_enabled = COALESCE(buyer_enabled, true),
    business_enabled = COALESCE(business_enabled, false),
    creator_enabled = COALESCE(creator_enabled, false),
    investor_enabled = COALESCE(investor_enabled, false),
    mentor_enabled = COALESCE(mentor_enabled, false),
    account_type = COALESCE(account_type, 'buyer'),
    language_preference = COALESCE(language_preference, ARRAY['English'])
WHERE 
    buyer_enabled IS NULL 
    OR business_enabled IS NULL 
    OR creator_enabled IS NULL 
    OR investor_enabled IS NULL 
    OR mentor_enabled IS NULL 
    OR account_type IS NULL 
    OR language_preference IS NULL;

-- 6. Show the final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 7. Show sample profiles with role settings
SELECT 
    id,
    full_name,
    account_type,
    buyer_enabled,
    business_enabled,
    creator_enabled,
    investor_enabled,
    mentor_enabled,
    language_preference,
    created_at
FROM public.profiles 
LIMIT 5;

-- 8. Success message
SELECT 'Profiles table schema updated successfully! All role management columns are now in place.' as result;
