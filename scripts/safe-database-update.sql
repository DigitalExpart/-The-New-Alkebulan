-- Safe Database Update for Diaspora Market Hub
-- This script safely adds new fields without dropping existing data
-- Run this in your Supabase SQL Editor

-- Create custom types only if they don't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('meetup', 'workshop', 'conference', 'webinar');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('buyer', 'seller');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to the profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS account_type TEXT,
ADD COLUMN IF NOT EXISTS buyer_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS seller_enabled BOOLEAN DEFAULT FALSE;

-- Add unique constraint to username if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add check constraint to account_type if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_account_type_check CHECK (account_type IN ('buyer', 'seller'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_buyer_enabled ON public.profiles(buyer_enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_seller_enabled ON public.profiles(seller_enabled);

-- Update existing profiles to have default values for new fields
UPDATE public.profiles 
SET 
    user_id = COALESCE(user_id, id),
    first_name = COALESCE(first_name, SPLIT_PART(COALESCE(full_name, ''), ' ', 1)),
    last_name = COALESCE(last_name, CASE 
        WHEN full_name IS NULL OR full_name = '' THEN ''
        WHEN POSITION(' ' IN full_name) = 0 THEN ''
        ELSE SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    END),
    username = COALESCE(username, LOWER(REPLACE(COALESCE(full_name, 'user'), ' ', '_')) || '_' || SUBSTRING(id::text, 1, 8)),
    email = COALESCE(email, (SELECT email FROM auth.users WHERE id = profiles.id)),
    country = COALESCE(country, COALESCE(heritage_country, 'Unknown')),
    account_type = COALESCE(account_type, 'buyer'),
    buyer_enabled = COALESCE(buyer_enabled, TRUE),
    seller_enabled = COALESCE(seller_enabled, FALSE)
WHERE user_id IS NULL OR first_name IS NULL OR last_name IS NULL OR username IS NULL OR email IS NULL OR country IS NULL OR account_type IS NULL;

-- Add NOT NULL constraints only after data is populated
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL,
ALTER COLUMN username SET NOT NULL,
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN country SET NOT NULL,
ALTER COLUMN account_type SET NOT NULL;

-- Create or replace the function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create or replace trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Create new RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Public can view basic profile info" ON public.profiles
    FOR SELECT USING (TRUE);

-- Create or replace the function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        user_id,
        full_name,
        first_name,
        last_name,
        username,
        email,
        country,
        account_type,
        buyer_enabled,
        seller_enabled,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::text, 1, 8)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'country', 'Unknown'),
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'buyer'),
        CASE WHEN COALESCE(NEW.raw_user_meta_data->>'account_type', 'buyer') = 'buyer' THEN TRUE ELSE FALSE END,
        CASE WHEN COALESCE(NEW.raw_user_meta_data->>'account_type', 'buyer') = 'seller' THEN TRUE ELSE FALSE END,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;

-- Verify the updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show current profile data to verify the update
SELECT 
    id,
    user_id,
    full_name,
    first_name,
    last_name,
    username,
    email,
    country,
    account_type,
    buyer_enabled,
    seller_enabled,
    created_at
FROM public.profiles
LIMIT 5;
