-- Simple Post Media Storage Setup for The New Alkebulan
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

-- Success message
SELECT 'Post media storage bucket created successfully!' as status;
SELECT 'Note: Storage policies may need to be configured manually in Supabase Dashboard' as info;
