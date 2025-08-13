-- Fix Seller Settings Table - Add Missing Columns
-- Run this in your Supabase SQL Editor

-- First, let's check what columns currently exist
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'seller_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
ALTER TABLE public.seller_settings
ADD COLUMN IF NOT EXISTS store_categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS store_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS store_banner_url TEXT,
ADD COLUMN IF NOT EXISTS store_logo_url TEXT,
ADD COLUMN IF NOT EXISTS store_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS shipping_settings JSONB DEFAULT '{
    "free_shipping_threshold": 50,
    "flat_rate_shipping": 5.99,
    "shipping_zones": [],
    "processing_time": "1-2 business days"
}'::jsonb,
ADD COLUMN IF NOT EXISTS return_policy JSONB DEFAULT '{
    "accepts_returns": true,
    "return_window_days": 30,
    "return_conditions": "Item must be unused and in original packaging",
    "refund_method": "original_payment"
}'::jsonb,
ADD COLUMN IF NOT EXISTS payment_settings JSONB DEFAULT '{
    "accepted_methods": ["credit_card", "paypal"],
    "auto_capture": true,
    "currency": "USD"
}'::jsonb,
ADD COLUMN IF NOT EXISTS store_email TEXT,
ADD COLUMN IF NOT EXISTS store_phone TEXT,
ADD COLUMN IF NOT EXISTS store_address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "17:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
    "thursday": {"open": "09:00", "close": "17:00", "closed": false},
    "friday": {"open": "09:00", "close": "17:00", "closed": false},
    "saturday": {"open": "10:00", "close": "16:00", "closed": false},
    "sunday": {"open": "12:00", "close": "16:00", "closed": true}
}'::jsonb,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS social_media_links JSONB DEFAULT '{}';

-- Add the store_status check constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'seller_settings_store_status_check'
    ) THEN
        ALTER TABLE public.seller_settings 
        ADD CONSTRAINT seller_settings_store_status_check 
        CHECK (store_status IN ('draft', 'active', 'suspended', 'closed'));
    END IF;
END $$;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_seller_settings_user_id ON public.seller_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_settings_status ON public.seller_settings(store_status);
CREATE INDEX IF NOT EXISTS idx_seller_settings_categories ON public.seller_settings USING GIN(store_categories);
CREATE INDEX IF NOT EXISTS idx_seller_settings_tags ON public.seller_settings USING GIN(store_tags);

-- Enable Row Level Security if not already enabled
ALTER TABLE public.seller_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own seller settings" ON public.seller_settings;
DROP POLICY IF EXISTS "Users can insert own seller settings" ON public.seller_settings;
DROP POLICY IF EXISTS "Users can update own seller settings" ON public.seller_settings;
DROP POLICY IF EXISTS "Users can delete own seller settings" ON public.seller_settings;

-- Create RLS policies
CREATE POLICY "Users can view own seller settings" ON public.seller_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own seller settings" ON public.seller_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seller settings" ON public.seller_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own seller settings" ON public.seller_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Create or replace the function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_seller_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_seller_settings_updated_at ON public.seller_settings;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_seller_settings_updated_at
    BEFORE UPDATE ON public.seller_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_settings_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.seller_settings TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify the final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'seller_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any existing records and create default settings for them
INSERT INTO public.seller_settings (user_id, store_name, store_description)
SELECT 
    p.id,
    'My Store',
    'Welcome to my store!'
FROM public.profiles p
WHERE p.seller_enabled = true
AND NOT EXISTS (
    SELECT 1 FROM public.seller_settings ss 
    WHERE ss.user_id = p.id
);

-- Show the final result
SELECT 
    'Table fixed successfully!' as status,
    COUNT(*) as total_records,
    'seller_settings' as table_name
FROM public.seller_settings;
