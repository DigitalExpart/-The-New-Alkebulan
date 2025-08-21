-- Setup Post Media Storage for The New Alkebulan
-- This script creates the storage bucket for post media uploads

-- Step 1: Create the post-media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-media',
  'post-media',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg']
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Create storage policies for the post-media bucket
-- Note: These policies work with Supabase's storage system

-- Allow authenticated users to upload media to post-media bucket
CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-media' 
    AND auth.role() = 'authenticated'
  );

-- Allow public access to view media from post-media bucket
CREATE POLICY "Public can view post media" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-media');

-- Allow users to update their own media in post-media bucket
CREATE POLICY "Users can update their own media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'post-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own media from post-media bucket
CREATE POLICY "Users can delete their own media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Success message
SELECT 'Post media storage setup completed successfully!' as status;
