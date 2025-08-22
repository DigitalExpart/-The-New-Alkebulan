-- Quick Setup Script for Products Backend
-- Run this in your Supabase SQL editor to set up everything at once

-- 1. Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(100) NOT NULL,
  actual_price DECIMAL(15,2) NOT NULL,
  sales_price DECIMAL(15,2),
  description TEXT NOT NULL,
  additional_description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  inventory INTEGER DEFAULT 1,
  has_variants BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create product variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_type VARCHAR(20) NOT NULL CHECK (variant_type IN ('color', 'size', 'number', 'weight')),
  variant_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create product images table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  image_name VARCHAR(255) NOT NULL,
  image_size INTEGER NOT NULL,
  image_type VARCHAR(50) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create product videos table
CREATE TABLE IF NOT EXISTS public.product_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  video_name VARCHAR(255) NOT NULL,
  video_size INTEGER NOT NULL,
  video_type VARCHAR(50) NOT NULL,
  duration INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create product categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('physical', 'digital')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create product subcategories table
CREATE TABLE IF NOT EXISTS public.product_subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- 7. Create product inventory table
CREATE TABLE IF NOT EXISTS public.product_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_combination JSONB,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create product reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- 9. Create product favorites table
CREATE TABLE IF NOT EXISTS public.product_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- 10. Create product views table
CREATE TABLE IF NOT EXISTS public.product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create indexes
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_videos_product_id ON public.product_videos(product_id);

-- 12. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- 13. Create basic RLS policies
CREATE POLICY "Users can view all active products" ON public.products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage their own products" ON public.products
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view variants of active products" ON public.product_variants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND status = 'active')
  );

CREATE POLICY "Users can manage variants of their own products" ON public.product_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND auth.uid() = user_id)
  );

CREATE POLICY "Users can view images of active products" ON public.product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND status = 'active')
  );

CREATE POLICY "Users can manage images of their own products" ON public.product_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND auth.uid() = user_id)
  );

CREATE POLICY "Users can view videos of active products" ON public.product_videos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND status = 'active')
  );

CREATE POLICY "Users can manage videos of their own products" ON public.product_videos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND auth.uid() = user_id)
  );

CREATE POLICY "Authenticated users can view categories" ON public.product_categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view subcategories" ON public.product_subcategories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view inventory of active products" ON public.product_inventory
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND status = 'active')
  );

CREATE POLICY "Users can manage inventory of their own products" ON public.product_inventory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND auth.uid() = user_id)
  );

CREATE POLICY "Users can view reviews of active products" ON public.product_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND status = 'active')
  );

CREATE POLICY "Users can create reviews for active products" ON public.product_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND status = 'active')
  );

CREATE POLICY "Users can manage their own reviews" ON public.product_reviews
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON public.product_favorites
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can create product views" ON public.product_views
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND status = 'active')
  );

-- 14. Grant permissions
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.product_variants TO authenticated;
GRANT ALL ON public.product_images TO authenticated;
GRANT ALL ON public.product_videos TO authenticated;
GRANT ALL ON public.product_categories TO authenticated;
GRANT ALL ON public.product_subcategories TO authenticated;
GRANT ALL ON public.product_inventory TO authenticated;
GRANT ALL ON public.product_reviews TO authenticated;
GRANT ALL ON public.product_favorites TO authenticated;
GRANT ALL ON public.product_views TO authenticated;

-- 15. Insert default categories and subcategories
INSERT INTO public.product_categories (name, type, description) VALUES
  ('Physical Products', 'physical', 'Tangible items that can be shipped'),
  ('Digital Products', 'digital', 'Intangible items delivered electronically')
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  physical_id UUID;
  digital_id UUID;
BEGIN
  SELECT id INTO physical_id FROM public.product_categories WHERE name = 'Physical Products';
  SELECT id INTO digital_id FROM public.product_categories WHERE name = 'Digital Products';
  
  -- Insert physical subcategories
  INSERT INTO public.product_subcategories (category_id, name, description) VALUES
    (physical_id, 'Accessories', 'General accessories and add-ons'),
    (physical_id, 'Clothing & Fashion', 'Apparel, shoes, fashion items'),
    (physical_id, 'Food & Beverages', 'Edible products and drinks'),
    (physical_id, 'Health & Wellness', 'Health products, supplements, fitness items'),
    (physical_id, 'Home & Garden', 'Home decor, furniture, garden supplies'),
    (physical_id, 'Jewelry & Watches', 'Fine jewelry, watches, accessories'),
    (physical_id, 'Sports & Recreation', 'Sports equipment, outdoor gear'),
    (physical_id, 'Beauty & Personal Care', 'Cosmetics, skincare, grooming'),
    (physical_id, 'Electronics & Gadgets', 'Tech devices and accessories'),
    (physical_id, 'Books & Stationery', 'Physical books, writing supplies'),
    (physical_id, 'Toys & Games', 'Children''s toys, board games'),
    (physical_id, 'Automotive & Parts', 'Car accessories, parts, maintenance')
  ON CONFLICT (category_id, name) DO NOTHING;
  
  -- Insert digital subcategories
  INSERT INTO public.product_subcategories (category_id, name, description) VALUES
    (digital_id, 'Software & Apps', 'Applications, tools, utilities'),
    (digital_id, 'Online Courses', 'Educational content, training programs'),
    (digital_id, 'E-books & Guides', 'Digital books, manuals, guides'),
    (digital_id, 'Templates & Designs', 'Design files, templates, graphics'),
    (digital_id, 'Music & Audio', 'Audio content, podcasts, sound files'),
    (digital_id, 'Video & Film', 'Video content, courses, films'),
    (digital_id, 'Photography & Art', 'Digital art, photos, creative content'),
    (digital_id, 'Consulting Services', 'Professional advice, coaching'),
    (digital_id, 'Webinars & Events', 'Live events, virtual conferences'),
    (digital_id, 'Memberships & Subscriptions', 'Ongoing access, premium content'),
    (digital_id, 'Licenses & Certifications', 'Official credentials, permits'),
    (digital_id, 'Data & Analytics', 'Reports, data sets, insights')
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- 16. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_inventory_updated_at BEFORE UPDATE ON public.product_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. Verify setup
SELECT 'Products backend setup completed successfully!' as status;

-- Show table counts
SELECT 
  'products' as table_name,
  COUNT(*) as record_count
FROM public.products
UNION ALL
SELECT 
  'product_categories' as table_name,
  COUNT(*) as record_count
FROM public.product_categories
UNION ALL
SELECT 
  'product_subcategories' as table_name,
  COUNT(*) as record_count
FROM public.product_subcategories;
