-- Setup Storage for Post Images
-- This script creates a storage bucket and sets up policies for post image uploads

-- Create the storage bucket for post images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public access to post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own post images" ON storage.objects;

-- Create a simple policy to allow all authenticated users to upload
CREATE POLICY "Allow authenticated users to upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public access to view post images (for displaying them)
CREATE POLICY "Allow public access to post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- Allow users to update their own post images
CREATE POLICY "Allow users to update their own post images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'post-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own post images
CREATE POLICY "Allow users to delete their own post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify the setup
SELECT 'Post images storage bucket and policies created successfully!' as result; 