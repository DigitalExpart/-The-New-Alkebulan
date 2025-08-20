# Media Upload Setup Guide for Supabase

## Overview
This guide explains how to set up the necessary database changes in Supabase to enable media upload functionality for community posts.

## What You Need to Do

### 1. Access Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to the "SQL Editor" section

### 2. Run the Simplified SQL Script First
- Copy the entire contents of `supabase-media-setup-simple.sql`
- Paste it into the SQL Editor
- Click "Run" to execute all the commands

**Note**: This script only handles database schema changes. Storage bucket setup must be done via the dashboard.

### 3. Set Up Storage Bucket via Dashboard
Since you can't modify storage tables directly via SQL, you need to use the Supabase Dashboard:

1. **Go to Storage section** in your Supabase dashboard
2. **Click "Create a new bucket"**
3. **Enter bucket details**:
   - **Name**: `community-media`
   - **Public bucket**: ✅ Check this (files will be publicly viewable)
   - **File size limit**: `100 MB`
4. **Click "Create bucket"**

### 4. Configure Storage Policies via Dashboard
After creating the bucket, set up the policies:

1. **Go to Storage > Policies** in your dashboard
2. **Select the `community-media` bucket**
3. **Add these policies**:

#### Policy 1: Allow authenticated users to upload
- **Policy name**: `Users can upload media files`
- **Allowed operation**: INSERT
- **Target roles**: `authenticated`
- **Policy definition**: `true`

#### Policy 2: Allow public to view files
- **Policy name**: `Public can view media files`
- **Allowed operation**: SELECT
- **Target roles**: `public`
- **Policy definition**: `true`

#### Policy 3: Allow users to delete their own files
- **Policy name**: `Users can delete their own media files`
- **Allowed operation**: DELETE
- **Target roles**: `authenticated`
- **Policy definition**: `auth.uid()::text = (storage.foldername(name))[1]`

### 5. What the Script Does

#### Creates Storage Bucket
- **Bucket Name**: `community-media`
- **Public Access**: Yes (files can be viewed by anyone)
- **File Size Limit**: 100MB
- **Allowed Formats**: 
  - Images: JPEG, PNG, GIF, WebP
  - Videos: MP4, AVI, MOV, WMV, FLV, WebM

#### Sets Up Security Policies
- **Upload**: Only authenticated users can upload
- **View**: Anyone can view uploaded files
- **Delete**: Only the uploader can delete their files

#### Updates Database Schema
- Adds `media_urls` column (array of file URLs)
- Adds `location_name` column (text)
- Adds `location_coordinates` column (text)
- Adds `feels_emoji` column (text)
- Adds `feels_description` column (text)

#### Configures Row Level Security (RLS)
- Only community members can create posts
- Anyone can view posts
- Only post authors can edit/delete their posts

### 6. Alternative: Step-by-Step Setup

If you prefer to run commands individually:

#### Step 1: Create Storage Bucket
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-media',
  'community-media',
  true,
  104857600,
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'
  ]
);
```

#### Step 2: Enable Storage Policies
```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Upload policy
CREATE POLICY "Users can upload media files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'community-media' 
    AND auth.role() = 'authenticated'
  );

-- View policy
CREATE POLICY "Public can view media files" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-media');
```

#### Step 3: Add Table Columns
```sql
-- Add media_urls column
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS media_urls TEXT[];

-- Add other columns as needed
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS location_name TEXT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS location_coordinates TEXT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS feels_emoji TEXT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS feels_description TEXT;
```

#### Step 4: Configure Post Policies
```sql
-- Enable RLS on community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Create post policy
CREATE POLICY "Community members can create posts" ON community_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_id = community_posts.community_id 
      AND user_id = auth.uid()
    )
  );
```

### 7. Verification

After running the setup, verify everything worked:

```sql
-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'community-media';

-- Check table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'community_posts';

-- Check policies
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'community_posts';
```

### 8. Troubleshooting

#### Common Issues:

1. **"must be owner of table objects" error**
   - This happens when trying to modify storage tables via SQL
   - **Solution**: Use the Supabase Dashboard to create storage bucket and policies
   - Storage tables are system tables that regular users cannot modify

2. **"Permission denied" errors**
   - Make sure you're running as a superuser or have the right permissions
   - Check if RLS is properly configured

2. **Storage bucket already exists**
   - The script uses `ON CONFLICT DO NOTHING` to handle this
   - You can safely run it multiple times

3. **Columns already exist**
   - The script checks before adding columns
   - No errors will occur if columns already exist

4. **Policies already exist**
   - The script drops existing policies before creating new ones
   - This ensures clean setup

### 9. Testing

After setup, test the functionality:

1. **Try uploading a small image** (JPEG/PNG under 1MB)
2. **Check the browser console** for upload progress
3. **Verify the file appears** in your Supabase storage
4. **Check the post** is created with the media URL

### 10. Security Notes

- **File size limits** are enforced at the storage level
- **File type validation** happens both client-side and server-side
- **Access control** is managed through RLS policies
- **Public files** can be viewed by anyone with the URL

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify all SQL commands executed successfully
3. Check that your Supabase project has storage enabled
4. Ensure your user has the necessary permissions

The setup script includes comprehensive error handling and will notify you of any issues during execution.
