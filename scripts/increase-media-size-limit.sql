-- Increase Media Size Limit to 500MB
-- This script increases the file size limit for media uploads

-- Check current storage limits
SELECT 
    name,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'post-media';

-- Update the post-media bucket to allow 500MB files
UPDATE storage.buckets 
SET file_size_limit = 524288000  -- 500MB in bytes (500 * 1024 * 1024)
WHERE name = 'post-media';

-- Also update allowed MIME types to include common image and video formats
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
WHERE name = 'post-media';

-- Verify the changes
SELECT 
    name,
    file_size_limit,
    file_size_limit / 1024 / 1024 as file_size_limit_mb,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'post-media';

-- If the bucket doesn't exist, create it with the proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
    'post-media',
    'post-media', 
    true,
    524288000, -- 500MB
    ARRAY[
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/tiff',
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/avi',
        'video/mov',
        'video/wmv',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'post-media'
);

-- Ensure RLS policies are in place for the bucket
DO $$
BEGIN
    -- Allow authenticated users to upload files
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Allow authenticated users to upload to post-media'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload to post-media"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'post-media' AND auth.role() = 'authenticated');
    END IF;

    -- Allow public access to files
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Allow public access to post-media'
    ) THEN
        CREATE POLICY "Allow public access to post-media"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'post-media');
    END IF;

    -- Allow users to update their own files
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Allow users to update their own files in post-media'
    ) THEN
        CREATE POLICY "Allow users to update their own files in post-media"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    -- Allow users to delete their own files
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Allow users to delete their own files in post-media'
    ) THEN
        CREATE POLICY "Allow users to delete their own files in post-media"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;
