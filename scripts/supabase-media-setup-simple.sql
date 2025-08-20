-- =====================================================
-- Simplified Supabase Media Upload Setup Script
-- =====================================================
-- This script handles only the parts you can control as a regular user
-- Storage bucket setup must be done via Supabase Dashboard

-- =====================================================
-- 1. UPDATE COMMUNITY POSTS TABLE SCHEMA
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
-- 2. UPDATE RLS POLICIES FOR COMMUNITY POSTS
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
-- 3. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Create index on community_posts for faster queries
CREATE INDEX IF NOT EXISTS idx_community_posts_community_id ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);

-- Create index on community_members for faster membership checks
CREATE INDEX IF NOT EXISTS idx_community_members_community_user ON community_members(community_id, user_id);

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

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
-- SCRIPT COMPLETION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Database Schema Setup Completed!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Community posts table schema updated';
  RAISE NOTICE 'RLS policies configured for community posts';
  RAISE NOTICE 'Performance indexes created';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'IMPORTANT: You still need to set up storage bucket';
  RAISE NOTICE 'via Supabase Dashboard (see README for instructions)';
  RAISE NOTICE '=====================================================';
END $$;
