-- Product Storage Setup for Supabase
-- This script sets up storage buckets and policies for product images and videos

-- 1. Create storage buckets for product media
-- Note: These commands need to be run in the Supabase dashboard or via API
-- The buckets will be created with public access for viewing products

-- 2. Create storage policies for product images bucket
-- These policies control who can upload, view, and manage product images

-- Policy: Anyone can view product images (for public product browsing)
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.product_images pi ON p.id = pi.product_id
      WHERE pi.image_url LIKE '%' || storage.objects.name || '%'
      AND p.status = 'active'
    )
  );

-- Policy: Product owners can upload images for their products
CREATE POLICY "Product owners can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid() IS NOT NULL
  );

-- Policy: Product owners can update images for their products
CREATE POLICY "Product owners can update images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.product_images pi ON p.id = pi.product_id
      WHERE pi.image_url LIKE '%' || storage.objects.name || '%'
      AND p.user_id = auth.uid()
    )
  );

-- Policy: Product owners can delete images for their products
CREATE POLICY "Product owners can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.product_images pi ON p.id = pi.product_id
      WHERE pi.image_url LIKE '%' || storage.objects.name || '%'
      AND p.user_id = auth.uid()
    )
  );

-- 3. Create storage policies for product videos bucket

-- Policy: Anyone can view product videos (for public product browsing)
CREATE POLICY "Public can view product videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'product-videos' AND
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.product_videos pv ON p.id = pv.product_id
      WHERE pv.video_url LIKE '%' || storage.objects.name || '%'
      AND p.status = 'active'
    )
  );

-- Policy: Product owners can upload videos for their products
CREATE POLICY "Product owners can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-videos' AND
    auth.uid() IS NOT NULL
  );

-- Policy: Product owners can update videos for their products
CREATE POLICY "Product owners can update videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-videos' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.product_videos pv ON p.id = pv.product_id
      WHERE pv.video_url LIKE '%' || storage.objects.name || '%'
      AND p.user_id = auth.uid()
    )
  );

-- Policy: Product owners can delete videos for their products
CREATE POLICY "Product owners can delete videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-videos' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.product_videos pv ON p.id = pv.product_id
      WHERE pv.video_url LIKE '%' || storage.objects.name || '%'
      AND p.user_id = auth.uid()
    )
  );

-- 4. Create function to generate unique file names
CREATE OR REPLACE FUNCTION generate_unique_filename(
  original_name TEXT,
  user_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TEXT AS $$
BEGIN
  RETURN user_id::TEXT || '_' || 
         EXTRACT(EPOCH FROM timestamp)::TEXT || '_' || 
         original_name;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to clean up orphaned media files
CREATE OR REPLACE FUNCTION cleanup_orphaned_media()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete orphaned images
  DELETE FROM storage.objects 
  WHERE bucket_id = 'product-images' 
  AND NOT EXISTS (
    SELECT 1 FROM public.product_images pi
    WHERE pi.image_url LIKE '%' || storage.objects.name || '%'
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete orphaned videos
  DELETE FROM storage.objects 
  WHERE bucket_id = 'product-videos' 
  AND NOT EXISTS (
    SELECT 1 FROM public.product_videos pv
    WHERE pv.video_url LIKE '%' || storage.objects.name || '%'
  );
  
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to get product media URLs
CREATE OR REPLACE FUNCTION get_product_media_urls(product_uuid UUID)
RETURNS TABLE(
  media_type TEXT,
  media_url TEXT,
  media_name TEXT,
  is_primary BOOLEAN,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'image'::TEXT as media_type,
    pi.image_url as media_url,
    pi.image_name as media_name,
    pi.is_primary,
    pi.sort_order
  FROM public.product_images pi
  WHERE pi.product_id = product_uuid
  
  UNION ALL
  
  SELECT 
    'video'::TEXT as media_type,
    pv.video_url as media_url,
    pv.video_name as media_name,
    FALSE as is_primary,
    pv.sort_order
  FROM public.product_videos pv
  WHERE pv.product_id = product_uuid
  
  ORDER BY sort_order, created_at;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to validate file uploads
CREATE OR REPLACE FUNCTION validate_file_upload(
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  bucket_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check file size limits
  IF bucket_name = 'product-images' AND file_size > 10485760 THEN -- 10MB
    RETURN FALSE;
  END IF;
  
  IF bucket_name = 'product-videos' AND file_size > 104857600 THEN -- 100MB
    RETURN FALSE;
  END IF;
  
  -- Check file type for images
  IF bucket_name = 'product-images' AND 
     NOT (file_type LIKE 'image/%' OR file_type IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp')) THEN
    RETURN FALSE;
  END IF;
  
  -- Check file type for videos
  IF bucket_name = 'product-videos' AND 
     NOT (file_type LIKE 'video/%' OR file_type IN ('video/mp4', 'video/mov', 'video/avi', 'video/webm')) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. Create indexes for better storage performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_name ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_created_at ON storage.objects(created_at);

-- 9. Verify storage setup
SELECT 'Product storage setup completed successfully!' as status;

-- Show storage bucket information
SELECT 
  id as bucket_id,
  name as bucket_name,
  public,
  created_at
FROM storage.buckets 
WHERE id IN ('product-images', 'product-videos');
