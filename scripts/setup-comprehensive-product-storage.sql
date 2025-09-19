-- Comprehensive Product Media Storage Setup
-- This script creates a unified storage system for all product media types

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Main product media bucket (for images, videos, documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-media',
  'product-media',
  true,
  104857600, -- 100MB limit (for videos)
  ARRAY[
    -- Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    -- Videos  
    'video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime',
    -- Documents
    'application/pdf', 
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv'
  ]
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload product media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to product media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own product media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own product media" ON storage.objects;

-- Allow authenticated users to upload to product-media bucket
CREATE POLICY "Allow authenticated users to upload product media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-media' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to product media (for displaying products)
CREATE POLICY "Allow public access to product media"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-media');

-- Allow users to update their own product media
CREATE POLICY "Allow users to update their own product media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own product media
CREATE POLICY "Allow users to delete their own product media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- DATABASE TABLES FOR MEDIA TRACKING
-- ============================================================================

-- Enhanced product_images table (if not exists)
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL, -- References products table
    image_url TEXT NOT NULL, -- Storage path in product-media bucket
    image_name TEXT NOT NULL,
    image_size INTEGER DEFAULT 0,
    image_type TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product videos table
CREATE TABLE IF NOT EXISTS public.product_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL, -- References products table
    video_url TEXT NOT NULL, -- Storage path in product-media bucket
    video_name TEXT NOT NULL,
    video_size INTEGER DEFAULT 0,
    video_type TEXT,
    duration_seconds INTEGER,
    thumbnail_url TEXT, -- Optional thumbnail image
    sort_order INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product documents table
CREATE TABLE IF NOT EXISTS public.product_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL, -- References products table
    document_url TEXT NOT NULL, -- Storage path in product-media bucket
    document_name TEXT NOT NULL,
    document_size INTEGER DEFAULT 0,
    document_type TEXT,
    document_category TEXT, -- 'manual', 'specification', 'certificate', 'warranty', etc.
    sort_order INTEGER DEFAULT 0,
    description TEXT,
    is_public BOOLEAN DEFAULT true, -- Whether customers can download
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR MEDIA TABLES
-- ============================================================================

-- Product Images Policies
CREATE POLICY "Anyone can view product images" ON public.product_images
FOR SELECT USING (true);

CREATE POLICY "Product owners can manage their product images" ON public.product_images
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.id = product_images.product_id 
    AND p.user_id = auth.uid()
  )
);

-- Product Videos Policies  
CREATE POLICY "Anyone can view product videos" ON public.product_videos
FOR SELECT USING (true);

CREATE POLICY "Product owners can manage their product videos" ON public.product_videos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.id = product_videos.product_id 
    AND p.user_id = auth.uid()
  )
);

-- Product Documents Policies
CREATE POLICY "Anyone can view public product documents" ON public.product_documents
FOR SELECT USING (is_public = true);

CREATE POLICY "Product owners can manage their product documents" ON public.product_documents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.id = product_documents.product_id 
    AND p.user_id = auth.uid()
  )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Product Images Indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON public.product_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON public.product_images(sort_order);

-- Product Videos Indexes
CREATE INDEX IF NOT EXISTS idx_product_videos_product_id ON public.product_videos(product_id);
CREATE INDEX IF NOT EXISTS idx_product_videos_sort_order ON public.product_videos(sort_order);

-- Product Documents Indexes
CREATE INDEX IF NOT EXISTS idx_product_documents_product_id ON public.product_documents(product_id);
CREATE INDEX IF NOT EXISTS idx_product_documents_category ON public.product_documents(document_category);
CREATE INDEX IF NOT EXISTS idx_product_documents_is_public ON public.product_documents(is_public);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get primary product image
CREATE OR REPLACE FUNCTION public.get_product_primary_image(product_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    primary_image_url TEXT;
BEGIN
    SELECT image_url INTO primary_image_url
    FROM public.product_images
    WHERE product_id = product_uuid AND is_primary = true
    ORDER BY sort_order ASC, created_at ASC
    LIMIT 1;
    
    -- If no primary image, get the first image
    IF primary_image_url IS NULL THEN
        SELECT image_url INTO primary_image_url
        FROM public.product_images
        WHERE product_id = product_uuid
        ORDER BY sort_order ASC, created_at ASC
        LIMIT 1;
    END IF;
    
    RETURN primary_image_url;
END;
$$ LANGUAGE plpgsql;

-- Function to count product media
CREATE OR REPLACE FUNCTION public.get_product_media_counts(product_uuid UUID)
RETURNS TABLE(images_count INTEGER, videos_count INTEGER, documents_count INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM public.product_images WHERE product_id = product_uuid),
        (SELECT COUNT(*)::INTEGER FROM public.product_videos WHERE product_id = product_uuid),
        (SELECT COUNT(*)::INTEGER FROM public.product_documents WHERE product_id = product_uuid);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATE EXISTING PRODUCTS WITH PRIMARY IMAGES
-- ============================================================================

-- Update products table to have image_url from their primary image
UPDATE public.products 
SET image_url = public.get_product_primary_image(id)
WHERE id IN (
    SELECT DISTINCT product_id 
    FROM public.product_images 
    WHERE is_primary = true
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show bucket information
SELECT 
    'product-media bucket created/updated' as status,
    id,
    name,
    public,
    file_size_limit,
    array_length(allowed_mime_types, 1) as supported_mime_types_count
FROM storage.buckets 
WHERE id = 'product-media';

-- Show media tables created
SELECT 
    'Media tables' as category,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('product_images', 'product_videos', 'product_documents')
ORDER BY table_name;

SELECT 'Product media storage setup completed successfully!' as result;
