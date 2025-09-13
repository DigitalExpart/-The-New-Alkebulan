-- Fix User Signup Database Error
-- This script ensures all required columns exist in the profiles table for user registration

-- First, let's check what columns currently exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public' 
ORDER BY ordinal_position;

-- Add any missing columns that are required for user signup
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Nigeria',
ADD COLUMN IF NOT EXISTS buyer_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_buyer_enabled ON public.profiles(buyer_enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON public.profiles(is_public);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id,
    first_name,
    last_name,
    username,
    email,
    country,
    account_type,
    buyer_enabled,
    business_enabled,
    is_public,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'country', 'Nigeria'),
    CASE 
      WHEN (NEW.raw_user_meta_data->>'selected_roles')::jsonb ? 'business' THEN 'business'
      ELSE 'buyer'
    END,
    NOT ((NEW.raw_user_meta_data->>'selected_roles')::jsonb ? 'business'),
    (NEW.raw_user_meta_data->>'selected_roles')::jsonb ? 'business',
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test the setup by checking if all required columns exist
SELECT 
  'profiles table columns check' as test_name,
  COUNT(*) as total_columns,
  COUNT(CASE WHEN column_name IN ('id', 'user_id', 'first_name', 'last_name', 'username', 'email', 'country', 'account_type', 'buyer_enabled', 'business_enabled', 'is_public', 'created_at', 'updated_at') THEN 1 END) as required_columns_found
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';
