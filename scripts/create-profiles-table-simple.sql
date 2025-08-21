-- Create Profiles Table for Diaspora Market Hub (Simple Version)
-- Run this script in your Supabase SQL Editor to create the profiles table

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with all required fields
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    date_of_birth DATE,
    occupation TEXT,
    interests TEXT[],
    
    -- Role management fields (required by use-auth.tsx)
    business_enabled BOOLEAN DEFAULT FALSE,
    investor_enabled BOOLEAN DEFAULT FALSE,
    mentor_enabled BOOLEAN DEFAULT FALSE,
    creator_enabled BOOLEAN DEFAULT FALSE,
    selected_roles TEXT[] DEFAULT ARRAY['buyer'],
    account_type TEXT DEFAULT 'buyer',
    
    -- Additional fields for enhanced functionality
    phone TEXT,
    website TEXT,
    social_links JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX idx_profiles_last_name ON public.profiles(last_name);
CREATE INDEX idx_profiles_location ON public.profiles(location);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX idx_profiles_account_type ON public.profiles(account_type);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view all profiles (for community features)
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- Grant permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Success message
SELECT 'Profiles table created successfully with all required fields! You can now add profiles manually for existing users.' as message;
