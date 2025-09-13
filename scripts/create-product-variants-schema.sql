-- Product Variants Database Schema
-- This script creates comprehensive tables for product variants (colors, sizes, weights, numbers, etc.)

-- ============================================================================
-- PRODUCT VARIANTS CORE TABLES
-- ============================================================================

-- Main product variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL, -- References products table
    variant_type VARCHAR(50) NOT NULL, -- 'color', 'size', 'weight', 'number', 'model'
    variant_value TEXT NOT NULL, -- The actual value (e.g., 'Red', 'Large', '2.5kg', 'Model 123')
    variant_display_name TEXT, -- Optional display name (e.g., 'Crimson Red' for value 'red')
    additional_price DECIMAL(10,2) DEFAULT 0.00, -- Extra cost for this variant (+$5.00, -$2.00, etc.)
    sku_suffix VARCHAR(50), -- Additional SKU identifier (e.g., '-RED-L' for Red Large)
    inventory INTEGER DEFAULT 0, -- Stock for this specific variant
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    hex_color VARCHAR(7), -- For color variants (e.g., '#FF0000')
    image_url TEXT, -- Optional variant-specific image
    description TEXT, -- Additional details about this variant
    metadata JSONB DEFAULT '{}', -- Store additional variant data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, variant_type, variant_value)
);

-- Product variant combinations (for products with multiple variant types)
CREATE TABLE IF NOT EXISTS public.product_variant_combinations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    combination_name TEXT NOT NULL, -- e.g., "Red Large 2.5kg", "Blue Medium Model-A"
    variant_ids UUID[] NOT NULL, -- Array of variant IDs that make up this combination
    combination_sku VARCHAR(100), -- Full SKU for this combination
    combination_price DECIMAL(10,2), -- Total price for this combination
    combination_inventory INTEGER DEFAULT 0, -- Stock for this specific combination
    is_available BOOLEAN DEFAULT true,
    weight_grams INTEGER, -- Physical weight for shipping calculations
    dimensions JSONB, -- Store dimensions as {"length": 10, "width": 5, "height": 3}
    shipping_class VARCHAR(50), -- Shipping category for this combination
    barcode VARCHAR(100), -- UPC/EAN barcode for this combination
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Variant type definitions (predefined variant types with validation rules)
CREATE TABLE IF NOT EXISTS public.variant_type_definitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL, -- 'color', 'size', 'weight', 'number'
    display_name VARCHAR(100) NOT NULL, -- 'Colors', 'Sizes', 'Weights (kg)', 'Model Numbers'
    input_type VARCHAR(50) NOT NULL, -- 'text', 'color', 'number', 'select'
    validation_rules JSONB DEFAULT '{}', -- Store validation rules
    predefined_values TEXT[], -- Optional predefined values for select types
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variant pricing rules (for complex pricing based on combinations)
CREATE TABLE IF NOT EXISTS public.product_variant_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'base_price', 'variant_modifier', 'combination_override'
    conditions JSONB NOT NULL, -- Conditions for when this rule applies
    price_adjustment DECIMAL(10,2) NOT NULL, -- Price change amount
    adjustment_type VARCHAR(20) DEFAULT 'add', -- 'add', 'subtract', 'multiply', 'override'
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher priority rules override lower ones
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_type_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_pricing ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Product Variants Policies
CREATE POLICY "Anyone can view product variants" ON public.product_variants
FOR SELECT USING (true);

CREATE POLICY "Product owners can manage their product variants" ON public.product_variants
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.id = product_variants.product_id 
    AND p.user_id = auth.uid()
  )
);

-- Product Variant Combinations Policies
CREATE POLICY "Anyone can view product variant combinations" ON public.product_variant_combinations
FOR SELECT USING (true);

CREATE POLICY "Product owners can manage their product variant combinations" ON public.product_variant_combinations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.id = product_variant_combinations.product_id 
    AND p.user_id = auth.uid()
  )
);

-- Variant Type Definitions Policies (admin-only for managing variant types)
CREATE POLICY "Anyone can view variant type definitions" ON public.variant_type_definitions
FOR SELECT USING (true);

CREATE POLICY "Admins can manage variant type definitions" ON public.variant_type_definitions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_admin = true OR role = 'admin')
  )
);

-- Product Variant Pricing Policies
CREATE POLICY "Anyone can view product variant pricing" ON public.product_variant_pricing
FOR SELECT USING (true);

CREATE POLICY "Product owners can manage their product variant pricing" ON public.product_variant_pricing
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.id = product_variant_pricing.product_id 
    AND p.user_id = auth.uid()
  )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Product Variants Indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_type ON public.product_variants(variant_type);
CREATE INDEX IF NOT EXISTS idx_product_variants_available ON public.product_variants(is_available);
CREATE INDEX IF NOT EXISTS idx_product_variants_sort ON public.product_variants(sort_order);

-- Product Variant Combinations Indexes
CREATE INDEX IF NOT EXISTS idx_variant_combinations_product_id ON public.product_variant_combinations(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_combinations_available ON public.product_variant_combinations(is_available);
CREATE INDEX IF NOT EXISTS idx_variant_combinations_sku ON public.product_variant_combinations(combination_sku);

-- Variant Type Definitions Indexes
CREATE INDEX IF NOT EXISTS idx_variant_type_definitions_active ON public.variant_type_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_variant_type_definitions_sort ON public.variant_type_definitions(sort_order);

-- Product Variant Pricing Indexes
CREATE INDEX IF NOT EXISTS idx_variant_pricing_product_id ON public.product_variant_pricing(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_pricing_active ON public.product_variant_pricing(is_active);
CREATE INDEX IF NOT EXISTS idx_variant_pricing_priority ON public.product_variant_pricing(priority);

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Update timestamp trigger for variants
CREATE OR REPLACE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_variant_combinations_updated_at
    BEFORE UPDATE ON public.product_variant_combinations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL VARIANT TYPE DEFINITIONS
-- ============================================================================

-- Insert predefined variant types
INSERT INTO public.variant_type_definitions (type_name, display_name, input_type, validation_rules, predefined_values, sort_order) VALUES
('color', 'Colors', 'color', '{"required": false, "max_length": 50}', ARRAY['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Gray', 'Navy', 'Maroon', 'Teal', 'Lime'], 1),
('size', 'Sizes', 'select', '{"required": false}', ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XS', '3XS', '4XL', '5XL'], 2),
('weight', 'Weights (kg)', 'number', '{"required": false, "min": 0, "max": 1000, "step": 0.1}', ARRAY['0.5', '1.0', '1.5', '2.0', '2.5', '5.0', '10.0'], 3),
('number', 'Model Numbers', 'text', '{"required": false, "max_length": 100}', ARRAY['Model A', 'Model B', 'Model C', 'Version 1', 'Version 2', 'Pro', 'Standard', 'Premium'], 4),
('material', 'Materials', 'select', '{"required": false}', ARRAY['Cotton', 'Polyester', 'Wool', 'Silk', 'Leather', 'Plastic', 'Metal', 'Wood', 'Glass', 'Ceramic'], 5),
('style', 'Styles', 'select', '{"required": false}', ARRAY['Classic', 'Modern', 'Vintage', 'Casual', 'Formal', 'Sport', 'Luxury', 'Minimalist'], 6)
ON CONFLICT (type_name) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get all variants for a product
CREATE OR REPLACE FUNCTION public.get_product_variants(product_uuid UUID)
RETURNS TABLE(
    variant_type TEXT,
    variants JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.variant_type,
        jsonb_agg(
            jsonb_build_object(
                'id', pv.id,
                'value', pv.variant_value,
                'display_name', pv.variant_display_name,
                'additional_price', pv.additional_price,
                'inventory', pv.inventory,
                'is_available', pv.is_available,
                'hex_color', pv.hex_color,
                'image_url', pv.image_url
            ) ORDER BY pv.sort_order, pv.variant_value
        ) as variants
    FROM public.product_variants pv
    WHERE pv.product_id = product_uuid
    AND pv.is_available = true
    GROUP BY pv.variant_type
    ORDER BY MIN(pv.sort_order);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate variant combination price
CREATE OR REPLACE FUNCTION public.calculate_variant_combination_price(
    product_uuid UUID,
    variant_ids_array UUID[]
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    base_price DECIMAL(10,2);
    total_adjustment DECIMAL(10,2) := 0;
    variant_adjustment DECIMAL(10,2);
BEGIN
    -- Get base product price
    SELECT COALESCE(sales_price, actual_price, 0) INTO base_price
    FROM public.products
    WHERE id = product_uuid;
    
    -- Calculate total adjustment from variants
    SELECT COALESCE(SUM(additional_price), 0) INTO total_adjustment
    FROM public.product_variants
    WHERE id = ANY(variant_ids_array);
    
    RETURN base_price + total_adjustment;
END;
$$ LANGUAGE plpgsql;

-- Function to generate variant combination SKU
CREATE OR REPLACE FUNCTION public.generate_variant_combination_sku(
    product_uuid UUID,
    variant_ids_array UUID[]
)
RETURNS TEXT AS $$
DECLARE
    base_sku TEXT;
    sku_suffixes TEXT[];
    final_sku TEXT;
BEGIN
    -- Get base product SKU
    SELECT COALESCE(sku, id::text) INTO base_sku
    FROM public.products
    WHERE id = product_uuid;
    
    -- Get all SKU suffixes from variants
    SELECT array_agg(COALESCE(sku_suffix, LEFT(variant_value, 3)) ORDER BY variant_type)
    INTO sku_suffixes
    FROM public.product_variants
    WHERE id = ANY(variant_ids_array);
    
    -- Combine base SKU with suffixes
    final_sku := base_sku;
    IF array_length(sku_suffixes, 1) > 0 THEN
        final_sku := final_sku || '-' || array_to_string(sku_suffixes, '-');
    END IF;
    
    RETURN final_sku;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================================

-- View for products with their variant information
CREATE OR REPLACE VIEW public.products_with_variants AS
SELECT 
    p.*,
    COALESCE(variant_counts.total_variants, 0) as total_variants,
    COALESCE(variant_counts.variant_types, 0) as variant_types_count,
    COALESCE(variant_counts.available_combinations, 0) as available_combinations,
    variant_summary.variant_summary
FROM public.products p
LEFT JOIN (
    SELECT 
        product_id,
        COUNT(*) as total_variants,
        COUNT(DISTINCT variant_type) as variant_types,
        COUNT(DISTINCT CASE WHEN is_available THEN id END) as available_combinations
    FROM public.product_variants
    GROUP BY product_id
) variant_counts ON p.id = variant_counts.product_id
LEFT JOIN (
    SELECT 
        product_id,
        jsonb_object_agg(
            variant_type,
            jsonb_agg(
                jsonb_build_object(
                    'value', variant_value,
                    'price', additional_price,
                    'available', is_available
                ) ORDER BY sort_order
            )
        ) as variant_summary
    FROM public.product_variants
    WHERE is_available = true
    GROUP BY product_id
) variant_summary ON p.id = variant_summary.product_id;

-- View for variant combinations with calculated prices
CREATE OR REPLACE VIEW public.variant_combinations_with_pricing AS
SELECT 
    pvc.*,
    p.name as product_name,
    p.actual_price as base_price,
    public.calculate_variant_combination_price(pvc.product_id, pvc.variant_ids) as calculated_price,
    public.generate_variant_combination_sku(pvc.product_id, pvc.variant_ids) as calculated_sku,
    (
        SELECT array_agg(
            jsonb_build_object(
                'type', variant_type,
                'value', variant_value,
                'display_name', variant_display_name
            )
        )
        FROM public.product_variants
        WHERE id = ANY(pvc.variant_ids)
    ) as variant_details
FROM public.product_variant_combinations pvc
JOIN public.products p ON pvc.product_id = p.id;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample variants for existing products (if any exist)
DO $$
DECLARE
    sample_product_id UUID;
BEGIN
    -- Get a sample product ID to add variants to
    SELECT id INTO sample_product_id 
    FROM public.products 
    WHERE status = 'active' 
    LIMIT 1;
    
    IF sample_product_id IS NOT NULL THEN
        -- Add sample color variants
        INSERT INTO public.product_variants (product_id, variant_type, variant_value, variant_display_name, hex_color, additional_price, inventory, sort_order) VALUES
        (sample_product_id, 'color', 'red', 'Crimson Red', '#DC2626', 0.00, 10, 1),
        (sample_product_id, 'color', 'blue', 'Ocean Blue', '#2563EB', 0.00, 15, 2),
        (sample_product_id, 'color', 'green', 'Forest Green', '#16A34A', 5.00, 8, 3),
        (sample_product_id, 'color', 'black', 'Midnight Black', '#000000', 0.00, 20, 4)
        ON CONFLICT (product_id, variant_type, variant_value) DO NOTHING;
        
        -- Add sample size variants
        INSERT INTO public.product_variants (product_id, variant_type, variant_value, additional_price, inventory, sort_order) VALUES
        (sample_product_id, 'size', 'S', 0.00, 12, 1),
        (sample_product_id, 'size', 'M', 0.00, 18, 2),
        (sample_product_id, 'size', 'L', 5.00, 15, 3),
        (sample_product_id, 'size', 'XL', 10.00, 10, 4)
        ON CONFLICT (product_id, variant_type, variant_value) DO NOTHING;
        
        -- Add sample weight variants
        INSERT INTO public.product_variants (product_id, variant_type, variant_value, additional_price, inventory, sort_order) VALUES
        (sample_product_id, 'weight', '1.0', 0.00, 25, 1),
        (sample_product_id, 'weight', '2.5', 15.00, 20, 2),
        (sample_product_id, 'weight', '5.0', 30.00, 12, 3)
        ON CONFLICT (product_id, variant_type, variant_value) DO NOTHING;
        
        RAISE NOTICE 'Sample variants added to product: %', sample_product_id;
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show created tables
SELECT 
    'Variant tables' as category,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE '%variant%'
ORDER BY table_name;

-- Show variant type definitions
SELECT 
    type_name,
    display_name,
    input_type,
    array_length(predefined_values, 1) as predefined_count,
    is_active
FROM public.variant_type_definitions
ORDER BY sort_order;

-- Show sample variants (if any were created)
SELECT 
    p.name as product_name,
    pv.variant_type,
    COUNT(*) as variant_count,
    array_agg(pv.variant_value ORDER BY pv.sort_order) as variant_values
FROM public.products p
JOIN public.product_variants pv ON p.id = pv.product_id
GROUP BY p.id, p.name, pv.variant_type
ORDER BY p.name, pv.variant_type;

SELECT 'Product variants schema created successfully!' as result;
