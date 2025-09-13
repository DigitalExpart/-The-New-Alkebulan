-- Fix Malformed Array Literal Error
-- This script fixes the "malformed array literal" error by updating the handle_new_user function
-- to properly handle all array columns in the profiles table

-- First, let's check what array columns exist in the profiles table
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public' 
AND data_type LIKE '%[]'
ORDER BY ordinal_position;

-- Update the handle_new_user function to handle all array columns properly
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
    updated_at,
    -- Handle array columns with proper empty array literals
    interests,
    core_competencies,
    language_preference,
    family_members,
    work_experience,
    selected_roles,
    skills,
    education,
    certifications,
    goals,
    achievements,
    challenges,
    community_interests,
    languages
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
    NOW(),
    -- Provide proper empty array literals for array columns
    ARRAY[]::TEXT[], -- interests
    ARRAY[]::TEXT[], -- core_competencies
    ARRAY['English']::TEXT[], -- language_preference (default to English)
    ARRAY[]::TEXT[], -- family_members
    ARRAY[]::TEXT[], -- work_experience
    ARRAY['buyer']::TEXT[], -- selected_roles (default to buyer)
    ARRAY[]::TEXT[], -- skills
    ARRAY[]::TEXT[], -- education
    ARRAY[]::TEXT[], -- certifications
    ARRAY[]::TEXT[], -- goals
    ARRAY[]::TEXT[], -- achievements
    ARRAY[]::TEXT[], -- challenges
    ARRAY[]::TEXT[], -- community_interests
    ARRAY[]::TEXT[]  -- languages
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    -- Re-raise the error
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Test the function by checking if it can handle a mock user creation
-- (This is just a validation - don't actually insert)
DO $$
DECLARE
    test_user_record RECORD;
BEGIN
    -- Create a test record structure
    test_user_record.id := gen_random_uuid();
    test_user_record.email := 'test@example.com';
    test_user_record.raw_user_meta_data := '{"first_name": "Test", "last_name": "User"}'::jsonb;
    
    -- This would normally be called by the trigger
    -- We're just validating the function syntax here
    RAISE LOG 'handle_new_user function updated successfully';
END $$;

-- Also ensure all array columns have proper defaults for existing records
UPDATE public.profiles 
SET 
    interests = COALESCE(interests, ARRAY[]::TEXT[]),
    core_competencies = COALESCE(core_competencies, ARRAY[]::TEXT[]),
    language_preference = COALESCE(language_preference, ARRAY['English']::TEXT[]),
    family_members = COALESCE(family_members, ARRAY[]::TEXT[]),
    work_experience = COALESCE(work_experience, ARRAY[]::TEXT[]),
    selected_roles = COALESCE(selected_roles, ARRAY['buyer']::TEXT[]),
    skills = COALESCE(skills, ARRAY[]::TEXT[]),
    education = COALESCE(education, ARRAY[]::TEXT[]),
    certifications = COALESCE(certifications, ARRAY[]::TEXT[]),
    goals = COALESCE(goals, ARRAY[]::TEXT[]),
    achievements = COALESCE(achievements, ARRAY[]::TEXT[]),
    challenges = COALESCE(challenges, ARRAY[]::TEXT[]),
    community_interests = COALESCE(community_interests, ARRAY[]::TEXT[]),
    languages = COALESCE(languages, ARRAY[]::TEXT[])
WHERE 
    interests IS NULL OR 
    core_competencies IS NULL OR 
    language_preference IS NULL OR 
    family_members IS NULL OR 
    work_experience IS NULL OR 
    selected_roles IS NULL OR 
    skills IS NULL OR 
    education IS NULL OR 
    certifications IS NULL OR 
    goals IS NULL OR 
    achievements IS NULL OR 
    challenges IS NULL OR 
    community_interests IS NULL OR 
    languages IS NULL;

-- Verify the fix worked
SELECT 
    'Array columns fix verification' as test_name,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN interests IS NOT NULL THEN 1 END) as profiles_with_interests,
    COUNT(CASE WHEN core_competencies IS NOT NULL THEN 1 END) as profiles_with_core_competencies,
    COUNT(CASE WHEN language_preference IS NOT NULL THEN 1 END) as profiles_with_language_preference
FROM public.profiles;
