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

-- Allow all authenticated users to read profile images
CREATE POLICY "Allow authenticated users to read profile images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public access to view profile images (for displaying them)
CREATE POLICY "Allow public access to profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Allow users to update/delete their own uploads
CREATE POLICY "Allow users to update their own profile images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own profile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify the setup
SELECT 'Storage policies created successfully!' as result;

-- Show current policies
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'; 