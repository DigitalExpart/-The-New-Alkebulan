-- Create Seller Settings Table
-- Run this in your Supabase SQL Editor

-- Create the seller_settings table
CREATE TABLE IF NOT EXISTS public.seller_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Store Information
    store_name TEXT DEFAULT 'My Store',
    store_description TEXT DEFAULT 'Welcome to my store!',
    store_banner_url TEXT,
    store_logo_url TEXT,
    store_status TEXT DEFAULT 'draft' CHECK (store_status IN ('draft', 'active', 'suspended', 'closed')),
    
    -- Shipping Settings
    shipping_settings JSONB DEFAULT '{
        "free_shipping_threshold": 50,
        "flat_rate_shipping": 5.99,
        "shipping_zones": [],
        "processing_time": "1-2 business days"
    }'::jsonb,
    
    -- Return Policy
    return_policy JSONB DEFAULT '{
        "accepts_returns": true,
        "return_window_days": 30,
        "return_conditions": "Item must be unused and in original packaging",
        "refund_method": "original_payment"
    }'::jsonb,
    
    -- Payment Settings
    payment_settings JSONB DEFAULT '{
        "accepted_methods": ["credit_card", "paypal"],
        "auto_capture": true,
        "currency": "USD"
    }'::jsonb,
    
    -- Store Categories and Tags
    store_categories TEXT[] DEFAULT '{}',
    store_tags TEXT[] DEFAULT '{}',
    
    -- Contact Information
    store_email TEXT,
    store_phone TEXT,
    store_address JSONB DEFAULT '{}',
    
    -- Business Hours
    business_hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
        "thursday": {"open": "09:00", "close": "17:00", "closed": false},
        "friday": {"open": "09:00", "close": "17:00", "closed": false},
        "saturday": {"open": "10:00", "close": "16:00", "closed": false},
        "sunday": {"open": "12:00", "close": "16:00", "closed": true}
    }'::jsonb,
    
    -- SEO and Marketing
    meta_title TEXT,
    meta_description TEXT,
    social_media_links JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint on user_id
ALTER TABLE public.seller_settings 
ADD CONSTRAINT seller_settings_user_id_unique UNIQUE (user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seller_settings_user_id ON public.seller_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_settings_status ON public.seller_settings(store_status);
CREATE INDEX IF NOT EXISTS idx_seller_settings_categories ON public.seller_settings USING GIN(store_categories);
CREATE INDEX IF NOT EXISTS idx_seller_settings_tags ON public.seller_settings USING GIN(store_tags);

-- Enable Row Level Security
ALTER TABLE public.seller_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own seller settings" ON public.seller_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own seller settings" ON public.seller_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seller settings" ON public.seller_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own seller settings" ON public.seller_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_seller_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_seller_settings_updated_at
    BEFORE UPDATE ON public.seller_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_settings_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.seller_settings TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'seller_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;
