-- =====================================================
-- Supabase Media Upload Setup Script
-- =====================================================
-- This script sets up the necessary storage bucket, policies, and table modifications
-- for the community media upload functionality

-- =====================================================
-- 1. CREATE STORAGE BUCKET
-- =====================================================

-- Create storage bucket for community media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-media',
  'community-media',
  true,
  104857600, -- 100MB limit
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'
  ]
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. SET UP STORAGE POLICIES (RLS)
-- =====================================================

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media files" ON storage.objects;

-- Policy for uploading media (only authenticated users can upload)
CREATE POLICY "Users can upload media files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'community-media' 
    AND auth.role() = 'authenticated'
  );

-- Policy for viewing media (public read access)
CREATE POLICY "Public can view media files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'community-media'
  );

-- Policy for deleting media (only the user who uploaded can delete)
CREATE POLICY "Users can delete their own media files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'community-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- 3. UPDATE COMMUNITY POSTS TABLE SCHEMA
-- =====================================================

-- Check if media_urls column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_posts' AND column_name = 'media_urls'
  ) THEN
    ALTER TABLE community_posts ADD COLUMN media_urls TEXT[];
    RAISE NOTICE 'Added media_urls column to community_posts table';
  ELSE
    RAISE NOTICE 'media_urls column already exists in community_posts table';
  END IF;
END $$;

-- Check if location_name column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_posts' AND column_name = 'location_name'
  ) THEN
    ALTER TABLE community_posts ADD COLUMN location_name TEXT;
    RAISE NOTICE 'Added location_name column to community_posts table';
  ELSE
    RAISE NOTICE 'location_name column already exists in community_posts table';
  END IF;
END $$;

-- Check if location_coordinates column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_posts' AND column_name = 'location_coordinates'
  ) THEN
    ALTER TABLE community_posts ADD COLUMN location_coordinates TEXT;
    RAISE NOTICE 'Added location_coordinates column to community_posts table';
  ELSE
    RAISE NOTICE 'location_coordinates column already exists in community_posts table';
  END IF;
END $$;

-- Check if feels_emoji column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_posts' AND column_name = 'feels_emoji'
  ) THEN
    ALTER TABLE community_posts ADD COLUMN feels_emoji TEXT;
    RAISE NOTICE 'Added feels_emoji column to community_posts table';
  ELSE
    RAISE NOTICE 'feels_emoji column already exists in community_posts table';
  END IF;
END $$;

-- Check if feels_description column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_posts' AND column_name = 'feels_description'
  ) THEN
    ALTER TABLE community_posts ADD COLUMN feels_description TEXT;
    RAISE NOTICE 'Added feels_description column to community_posts table';
  ELSE
    RAISE NOTICE 'feels_description column already exists in community_posts table';
  END IF;
END $$;

-- =====================================================
-- 4. UPDATE RLS POLICIES FOR COMMUNITY POSTS
-- =====================================================

-- Ensure RLS is enabled on community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Community members can create posts" ON community_posts;
DROP POLICY IF EXISTS "Anyone can view community posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;

-- Policy for inserting posts (only community members can post)
CREATE POLICY "Community members can create posts" ON community_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_id = community_posts.community_id 
      AND user_id = auth.uid()
    )
  );

-- Policy for viewing posts (public read access)
CREATE POLICY "Anyone can view community posts" ON community_posts
  FOR SELECT USING (true);

-- Policy for updating posts (only the author can update)
CREATE POLICY "Users can update their own posts" ON community_posts
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- Policy for deleting posts (only the author can delete)
CREATE POLICY "Users can delete their own posts" ON community_posts
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- =====================================================
-- 5. VERIFICATION QUERIES
-- =====================================================

-- Check if storage bucket was created
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'community-media';

-- Check if storage policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check community_posts table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'community_posts' 
ORDER BY ordinal_position;

-- Check community_posts policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'community_posts';

-- =====================================================
-- 6. OPTIONAL: CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Create index on community_posts for faster queries
CREATE INDEX IF NOT EXISTS idx_community_posts_community_id ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);

-- Create index on community_members for faster membership checks
CREATE INDEX IF NOT EXISTS idx_community_members_community_user ON community_members(community_id, user_id);

-- =====================================================
-- SCRIPT COMPLETION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Supabase Media Upload Setup Script Completed!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Storage bucket "community-media" created/verified';
  RAISE NOTICE 'Storage policies configured';
  RAISE NOTICE 'Community posts table schema updated';
  RAISE NOTICE 'RLS policies configured for community posts';
  RAISE NOTICE 'Performance indexes created';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'You can now use the media upload functionality!';
  RAISE NOTICE '=====================================================';
END $$;
