-- Fix Date Field Issue and Add Missing Profile Columns
-- Run this in your Supabase SQL Editor

-- Add missing columns to the profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS place_of_birth TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS relationship_status TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS core_competencies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS family_members JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_language ON public.profiles(language_preference);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);

-- Update existing profiles to handle empty date values
UPDATE public.profiles 
SET date_of_birth = NULL 
WHERE date_of_birth = '';

-- Create a function to safely update profiles
CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_occupation TEXT DEFAULT NULL,
  p_education TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_language_preference TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_place_of_birth TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_relationship_status TEXT DEFAULT NULL,
  p_interests TEXT[] DEFAULT NULL,
  p_core_competencies TEXT[] DEFAULT NULL,
  p_family_members JSONB DEFAULT NULL,
  p_work_experience JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update the profile
  UPDATE public.profiles 
  SET 
    full_name = COALESCE(p_full_name, full_name),
    username = COALESCE(p_username, username),
    email = COALESCE(p_email, email),
    bio = COALESCE(p_bio, bio),
    location = COALESCE(p_location, location),
    website = COALESCE(p_website, website),
    phone = COALESCE(p_phone, phone),
    occupation = COALESCE(p_occupation, occupation),
    education = COALESCE(p_education, education),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    language_preference = COALESCE(p_language_preference, language_preference),
    region = COALESCE(p_region, region),
    gender = COALESCE(p_gender, gender),
    place_of_birth = COALESCE(p_place_of_birth, place_of_birth),
    date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
    relationship_status = COALESCE(p_relationship_status, relationship_status),
    interests = COALESCE(p_interests, interests),
    core_competencies = COALESCE(p_core_competencies, core_competencies),
    family_members = COALESCE(p_family_members, family_members),
    work_experience = COALESCE(p_work_experience, work_experience),
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT[], TEXT[], JSONB, JSONB) TO authenticated;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
