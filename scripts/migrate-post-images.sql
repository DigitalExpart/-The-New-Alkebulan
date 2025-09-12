-- Migration script to fix existing posts with images in metadata but not in image_url field
-- This fixes posts created before the image upload fix was implemented

-- Update posts that have media_urls in metadata but no image_url
UPDATE public.posts 
SET 
  image_url = (metadata->>'media_urls')::jsonb->>0,  -- Set first image as primary
  post_type = CASE 
    WHEN post_type = 'text' AND (metadata->>'media_urls')::jsonb IS NOT NULL 
         AND jsonb_array_length((metadata->>'media_urls')::jsonb) > 0 
    THEN 'image'
    ELSE post_type
  END,
  updated_at = NOW()
WHERE 
  -- Posts that have media_urls in metadata
  metadata ? 'media_urls' 
  AND (metadata->>'media_urls')::jsonb IS NOT NULL
  AND jsonb_array_length((metadata->>'media_urls')::jsonb) > 0
  -- But don't have image_url set
  AND (image_url IS NULL OR image_url = '');

-- Show results of the migration
SELECT 
  COUNT(*) as posts_updated,
  'Posts migrated to have image_url from metadata.media_urls' as description
FROM public.posts 
WHERE 
  image_url IS NOT NULL 
  AND image_url != ''
  AND metadata ? 'media_urls'
  AND (metadata->>'media_urls')::jsonb IS NOT NULL
  AND jsonb_array_length((metadata->>'media_urls')::jsonb) > 0;

-- Optional: Show a sample of migrated posts for verification
SELECT 
  id,
  content,
  image_url,
  post_type,
  metadata->'media_urls' as metadata_media_urls,
  created_at,
  updated_at
FROM public.posts 
WHERE 
  image_url IS NOT NULL 
  AND metadata ? 'media_urls'
  AND (metadata->>'media_urls')::jsonb IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;
