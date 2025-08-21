-- Create Complete Profiles Table for Diaspora Market Hub
-- Run this script in your Supabase SQL Editor to create the profiles table with ALL fields

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with ALL possible fields
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic profile information
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
    
    -- Additional profile fields
    phone TEXT,
    website TEXT,
    social_links JSONB,
    
    -- Professional fields
    core_competencies TEXT[],
    skills TEXT[],
    experience_years INTEGER,
    education TEXT[],
    certifications TEXT[],
    
    -- Business fields
    company_name TEXT,
    industry TEXT,
    company_size TEXT,
    revenue_range TEXT,
    
    -- Personal development fields
    goals TEXT[],
    achievements TEXT[],
    challenges TEXT[],
    
    -- Community fields
    community_interests TEXT[],
    languages TEXT[],
    cultural_background TEXT,
    
    -- Timestamps
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
CREATE INDEX idx_profiles_core_competencies ON public.profiles USING GIN(core_competencies);
CREATE INDEX idx_profiles_skills ON public.profiles USING GIN(skills);
CREATE INDEX idx_profiles_interests ON public.profiles USING GIN(interests);

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

-- Insert sample profile data ONLY for existing users
DO $$
DECLARE
    user_record RECORD;
    user_count INTEGER;
BEGIN
    -- Count existing users
    SELECT COUNT(*) INTO user_count FROM auth.users;

    -- Insert profiles for existing users
    FOR user_record IN SELECT id, email FROM auth.users LIMIT 10 LOOP
        INSERT INTO public.profiles (
            id,
            user_id,
            first_name,
            last_name,
            email,
            bio,
            location,
            occupation,
            interests,
            core_competencies,
            skills,
            business_enabled,
            investor_enabled,
            mentor_enabled,
            creator_enabled,
            selected_roles,
            account_type
        )
        VALUES (
            user_record.id,
            user_record.id,
            CASE
                WHEN user_record.id::text LIKE '%4e7a%' THEN 'John'
                WHEN user_record.id::text LIKE '%a99c%' THEN 'Jane'
                WHEN user_record.id::text LIKE '%8a4c%' THEN 'Mike'
                ELSE 'User'
            END,
            CASE
                WHEN user_record.id::text LIKE '%4e7a%' THEN 'Doe'
                WHEN user_record.id::text LIKE '%a99c%' THEN 'Smith'
                WHEN user_record.id::text LIKE '%8a4c%' THEN 'Johnson'
                ELSE 'User'
            END,
            user_record.email,
            CASE
                WHEN user_record.id::text LIKE '%4e7a%' THEN 'Community builder and tech enthusiast'
                WHEN user_record.id::text LIKE '%a99c%' THEN 'Passionate about connecting people'
                WHEN user_record.id::text LIKE '%8a4c%' THEN 'Building bridges between communities'
                ELSE 'Active community member'
            END,
            CASE
                WHEN user_record.id::text LIKE '%4e7a%' THEN 'New York, NY'
                WHEN user_record.id::text LIKE '%a99c%' THEN 'Los Angeles, CA'
                WHEN user_record.id::text LIKE '%8a4c%' THEN 'Chicago, IL'
                ELSE 'United States'
            END,
            CASE
                WHEN user_record.id::text LIKE '%4e7a%' THEN 'Software Developer'
                WHEN user_record.id::text LIKE '%a99c%' THEN 'Community Manager'
                WHEN user_record.id::text LIKE '%8a4c%' THEN 'Business Analyst'
                ELSE 'Professional'
            END,
            CASE
                WHEN user_record.id::text LIKE '%4e7a%' THEN ARRAY['Technology', 'Community Building', 'Innovation']
                WHEN user_record.id::text LIKE '%a99c%' THEN ARRAY['Networking', 'Leadership', 'Social Impact']
                WHEN user_record.id::text LIKE '%8a4c%' THEN ARRAY['Business', 'Analytics', 'Strategy']
                ELSE ARRAY['Community', 'Networking', 'Growth']
            END,
            CASE
                WHEN user_record.id::text LIKE '%4e7a%' THEN ARRAY['JavaScript', 'React', 'Node.js', 'Community Management']
                WHEN user_record.id::text LIKE '%a99c%' THEN ARRAY['Leadership', 'Communication', 'Project Management']
                WHEN user_record.id::text LIKE '%8a4c%' THEN ARRAY['Data Analysis', 'Business Strategy', 'Process Improvement']
                ELSE ARRAY['Communication', 'Networking', 'Problem Solving']
            END,
            CASE
                WHEN user_record.id::text LIKE '%4e7a%' THEN ARRAY['Web Development', 'API Design', 'Database Management']
                WHEN user_record.id::text LIKE '%a99c%' THEN ARRAY['Team Leadership', 'Event Planning', 'Conflict Resolution']
                WHEN user_record.id::text LIKE '%8a4c%' THEN ARRAY['Data Visualization', 'Business Intelligence', 'Strategic Planning']
                ELSE ARRAY['Communication', 'Organization', 'Adaptability']
            END,
            -- Role settings
            TRUE,  -- business_enabled
            FALSE, -- investor_enabled
            FALSE, -- mentor_enabled
            FALSE, -- creator_enabled
            ARRAY['business'], -- selected_roles
            'business' -- account_type
        )
        ON CONFLICT (id) DO NOTHING; -- Skip if profile already exists
    END LOOP;

    RAISE NOTICE 'Created profiles for % existing users', user_count;
END $$;

-- Grant permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Success message
SELECT 'Complete profiles table created successfully with ALL fields including core_competencies!' as message;
