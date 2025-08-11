-- Enhance profiles table with new comprehensive fields
-- This script adds all the new profile fields for the enhanced edit profile page

-- Add new columns to profiles table
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

-- Create indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_language ON public.profiles(language_preference);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_competencies ON public.profiles USING GIN(core_competencies);

-- Add constraints for data validation
ALTER TABLE public.profiles 
ADD CONSTRAINT check_language_preference 
CHECK (language_preference IN ('en', 'nl', 'fr', 'de', 'es', 'pt', 'ar', 'sw', 'yo', 'ig', 'ha', 'zu', 'xh', 'other'));

ALTER TABLE public.profiles 
ADD CONSTRAINT check_gender 
CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say'));

ALTER TABLE public.profiles 
ADD CONSTRAINT check_relationship_status 
CHECK (relationship_status IN ('single', 'in-relationship', 'engaged', 'married', 'divorced', 'widowed', 'complicated'));

-- Update existing profiles with default values if needed
UPDATE public.profiles 
SET 
  username = COALESCE(username, split_part(email, '@', 1)),
  language_preference = COALESCE(language_preference, 'en'),
  interests = COALESCE(interests, '{}'),
  core_competencies = COALESCE(core_competencies, '{}'),
  family_members = COALESCE(family_members, '[]'),
  work_experience = COALESCE(work_experience, '[]')
WHERE username IS NULL 
   OR language_preference IS NULL 
   OR interests IS NULL 
   OR core_competencies IS NULL 
   OR family_members IS NULL 
   OR work_experience IS NULL;

-- Create a function to validate JSON structure for family members
CREATE OR REPLACE FUNCTION validate_family_member_json(json_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if it's an array
  IF jsonb_typeof(json_data) != 'array' THEN
    RETURN FALSE;
  END IF;
  
  -- Check each array element has required fields
  FOR i IN 0..jsonb_array_length(json_data)-1 LOOP
    IF NOT (json_data->i ? 'name' AND json_data->i ? 'relationship') THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a function to validate JSON structure for work experience
CREATE OR REPLACE FUNCTION validate_work_experience_json(json_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if it's an array
  IF jsonb_typeof(json_data) != 'array' THEN
    RETURN FALSE;
  END IF;
  
  -- Check each array element has required fields
  FOR i IN 0..jsonb_array_length(json_data)-1 LOOP
    IF NOT (json_data->i ? 'company' AND json_data->i ? 'position' AND json_data->i ? 'start_date') THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add JSON validation constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT check_family_members_json 
CHECK (validate_family_member_json(family_members));

ALTER TABLE public.profiles 
ADD CONSTRAINT check_work_experience_json 
CHECK (validate_work_experience_json(work_experience));

-- Create a function to update profile with validation
CREATE OR REPLACE FUNCTION update_profile_enhanced(
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
  -- Validate input data
  IF p_language_preference IS NOT NULL AND p_language_preference NOT IN ('en', 'nl', 'fr', 'de', 'es', 'pt', 'ar', 'sw', 'yo', 'ig', 'ha', 'zu', 'xh', 'other') THEN
    RAISE EXCEPTION 'Invalid language preference: %', p_language_preference;
  END IF;
  
  IF p_gender IS NOT NULL AND p_gender NOT IN ('male', 'female', 'non-binary', 'prefer-not-to-say') THEN
    RAISE EXCEPTION 'Invalid gender: %', p_gender;
  END IF;
  
  IF p_relationship_status IS NOT NULL AND p_relationship_status NOT IN ('single', 'in-relationship', 'engaged', 'married', 'divorced', 'widowed', 'complicated') THEN
    RAISE EXCEPTION 'Invalid relationship status: %', p_relationship_status;
  END IF;
  
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
GRANT EXECUTE ON FUNCTION update_profile_enhanced(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT[], TEXT[], JSONB, JSONB) TO authenticated;

-- Create a view for public profile information (for community features)
CREATE OR REPLACE VIEW public_profile_view AS
SELECT 
  id,
  username,
  full_name,
  bio,
  location,
  occupation,
  education,
  avatar_url,
  language_preference,
  region,
  interests,
  core_competencies,
  created_at
FROM public.profiles 
WHERE is_public = true;

-- Grant read access to public profile view
GRANT SELECT ON public_profile_view TO authenticated;

-- Insert sample data for testing (optional)
-- INSERT INTO public.profiles (user_id, email, full_name, username, language_preference, region, interests, core_competencies)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'sample@example.com', 'Sample User', 'sampleuser', 'en', 'West Africa', 
--    ARRAY['African History', 'Web Development', 'Entrepreneurship'], 
--    ARRAY['JavaScript/TypeScript', 'Leadership', 'Project Management']);

-- Display the enhanced table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show summary of changes
SELECT 
  'Profiles table enhanced successfully!' as status,
  'New fields added: username, language_preference, region, gender, place_of_birth, date_of_birth, relationship_status, interests, core_competencies, family_members, work_experience' as details,
  'Indexes and constraints created for optimal performance' as performance,
  'JSON validation functions added for data integrity' as validation;
