-- Fix Missing is_public Column in Profiles Table
-- This script adds the missing is_public column that's causing the profile creation error

-- Add the missing is_public column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Add an index for better performance when filtering by public/private profiles
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON public.profiles(is_public);

-- Update existing profiles to be public by default (if they don't have this field set)
UPDATE public.profiles 
SET is_public = true 
WHERE is_public IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_public IS 'Whether the profile is publicly visible or private';

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public' 
AND column_name = 'is_public';
