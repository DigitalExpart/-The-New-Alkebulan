-- Create cart_items table for shopping cart functionality
-- This table stores items that users add to their cart, including variant selections

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    variant_selections JSONB, -- Store selected variant values: {"color": "red", "size": "large"}
    variant_info JSONB, -- Store variant display info: [{"type": "color", "display": "Red", "price": 0}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of user, product, and variant selections
    UNIQUE(user_id, product_id, variant_selections)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_created_at ON public.cart_items(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cart_items_updated_at();

-- RLS Policies
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own cart items
CREATE POLICY "Users can view their own cart items" ON public.cart_items
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own cart items
CREATE POLICY "Users can insert their own cart items" ON public.cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update their own cart items" ON public.cart_items
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete their own cart items" ON public.cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Create a view for cart items with product details
CREATE OR REPLACE VIEW public.cart_items_with_details AS
SELECT 
    ci.id,
    ci.user_id,
    ci.product_id,
    ci.quantity,
    ci.price,
    ci.variant_selections,
    ci.variant_info,
    ci.created_at,
    ci.updated_at,
    p.name as product_name,
    p.description as product_description,
    p.sku as product_sku,
    p.status as product_status,
    p.category as product_category,
    p.subcategory as product_subcategory,
    -- Get primary product image
    pi.image_url as product_image_url,
    -- Calculate total price (quantity * price)
    (ci.quantity * ci.price) as total_price
FROM public.cart_items ci
LEFT JOIN public.products p ON ci.product_id = p.id
LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE p.status = 'active'; -- Only show active products

-- RLS for the view
ALTER VIEW public.cart_items_with_details SET (security_invoker = true);

-- Create a function to get cart summary for a user
CREATE OR REPLACE FUNCTION public.get_cart_summary(user_uuid UUID)
RETURNS TABLE (
    total_items INTEGER,
    total_value DECIMAL(10,2),
    unique_products INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ci.quantity), 0)::INTEGER as total_items,
        COALESCE(SUM(ci.quantity * ci.price), 0) as total_value,
        COUNT(DISTINCT ci.product_id)::INTEGER as unique_products
    FROM public.cart_items ci
    LEFT JOIN public.products p ON ci.product_id = p.id
    WHERE ci.user_id = user_uuid 
    AND p.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT SELECT ON public.cart_items_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cart_summary(UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.cart_items IS 'Shopping cart items with variant selections';
COMMENT ON COLUMN public.cart_items.variant_selections IS 'JSON object storing selected variant values: {"color": "red", "size": "large"}';
COMMENT ON COLUMN public.cart_items.variant_info IS 'JSON array storing variant display information for cart display';
COMMENT ON VIEW public.cart_items_with_details IS 'Cart items with product details for display purposes';
COMMENT ON FUNCTION public.get_cart_summary(UUID) IS 'Get cart summary statistics for a user';
