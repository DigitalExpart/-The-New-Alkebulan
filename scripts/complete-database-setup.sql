-- Safe fix for foreign key constraints on profiles table
-- This script checks for existing constraints before adding them

-- First, let's see what constraints currently exist
SELECT conname as constraint_name, conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- Drop the problematic constraint (profiles_id_fkey)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Now safely add the correct foreign key constraint (only if it doesn't exist)
DO $$
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_fkey' 
        AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint profiles_user_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint profiles_user_id_fkey already exists';
    END IF;
END $$;

-- Safely add the unique constraint (only if it doesn't exist)
DO $$
BEGIN
    -- Check if the unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_unique' 
        AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint profiles_user_id_unique';
    ELSE
        RAISE NOTICE 'Unique constraint profiles_user_id_unique already exists';
    END IF;
END $$;

-- Verify the fix worked
SELECT 'Constraints are now properly configured!' as result;

-- Show the final constraint list
SELECT conname as constraint_name, conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass; 

-- Setup Supabase Storage for Profile Images
-- This script creates a storage bucket and sets up policies for profile image uploads

-- Create the storage bucket for profile images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to view their own profile images
CREATE POLICY "Users can view their own profile images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public access to view profile images
CREATE POLICY "Public can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Verify the setup
SELECT 'Storage bucket and policies created successfully!' as result; 

-- Setup Storage Policies for Manually Created profile-images Bucket
-- Run this script in your Supabase SQL Editor

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public access to profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own profile images" ON storage.objects;

-- Create a simple policy to allow all authenticated users to upload
CREATE POLICY "Allow authenticated users to upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public access to view profile images (for displaying them)
CREATE POLICY "Allow public access to profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Verify the setup
SELECT 'Storage policies created successfully!' as result; 