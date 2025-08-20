-- Add missing role columns to profiles table
-- This script adds creator_enabled, investor_enabled, and mentor_enabled columns
-- so users can activate/deactivate these tools in the role management page

-- Step 1: Add the missing role columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS creator_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS investor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mentor_enabled BOOLEAN DEFAULT false;

-- Step 2: Update existing profiles to have these columns set to false by default
UPDATE public.profiles 
SET 
    creator_enabled = COALESCE(creator_enabled, false),
    investor_enabled = COALESCE(investor_enabled, false),
    mentor_enabled = COALESCE(mentor_enabled, false)
WHERE creator_enabled IS NULL OR investor_enabled IS NULL OR mentor_enabled IS NULL;

-- Step 3: Make sure the columns are not null
ALTER TABLE public.profiles 
ALTER COLUMN creator_enabled SET NOT NULL,
ALTER COLUMN investor_enabled SET NOT NULL,
ALTER COLUMN mentor_enabled SET NOT NULL;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_creator_enabled ON public.profiles(creator_enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_investor_enabled ON public.profiles(investor_enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_mentor_enabled ON public.profiles(mentor_enabled);

-- Step 5: Update the handle_new_user function to include these new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, username, avatar_url, is_public, created_at, updated_at, creator_enabled, investor_enabled, mentor_enabled)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', SPLIT_PART(COALESCE(new.raw_user_meta_data->>'full_name', new.email), ' ', 1)),
    COALESCE(new.raw_user_meta_data->>'last_name', CASE 
      WHEN new.raw_user_meta_data->>'full_name' IS NOT NULL AND new.raw_user_meta_data->>'full_name' != '' THEN
        SUBSTRING(new.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN new.raw_user_meta_data->>'full_name') + 1)
      ELSE ''
    END),
    COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    true,
    NOW(),
    NOW(),
    false,  -- creator_enabled defaults to false
    false,  -- investor_enabled defaults to false
    false   -- mentor_enabled defaults to false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('creator_enabled', 'investor_enabled', 'mentor_enabled')
ORDER BY column_name;

-- Step 7: Test message
SELECT 'Role columns added successfully! Users can now activate/deactivate creator, investor, and mentor tools.' as result;
