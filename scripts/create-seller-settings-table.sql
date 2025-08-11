-- Create Seller Settings Table
-- This table stores all seller-specific configuration including store settings, shipping, returns, and payments

CREATE TABLE IF NOT EXISTS public.seller_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Store Information
    store_name TEXT,
    store_description TEXT,
    store_banner_url TEXT,
    store_logo_url TEXT,
    
    -- Shipping Settings
    shipping_settings JSONB DEFAULT '{
        "free_shipping_threshold": 0,
        "flat_rate_shipping": 0,
        "shipping_zones": []
    }'::jsonb,
    
    -- Return Policy
    return_policy JSONB DEFAULT '{
        "accepts_returns": true,
        "return_window_days": 30,
        "return_shipping_paid_by": "seller",
        "return_conditions": ["Unused", "Original packaging"]
    }'::jsonb,
    
    -- Payment & Payout Settings
    payment_settings JSONB DEFAULT '{
        "stripe_connected": false,
        "stripe_account_id": "",
        "payout_schedule": "weekly",
        "minimum_payout": 50
    }'::jsonb,
    
    -- Store Status
    store_status TEXT DEFAULT 'draft' CHECK (store_status IN ('draft', 'active', 'suspended', 'closed')),
    store_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seller_settings_user_id ON public.seller_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_settings_store_status ON public.seller_settings(store_status);
CREATE INDEX IF NOT EXISTS idx_seller_settings_store_verified ON public.seller_settings(store_verified);
CREATE INDEX IF NOT EXISTS idx_seller_settings_shipping ON public.seller_settings USING GIN(shipping_settings);
CREATE INDEX IF NOT EXISTS idx_seller_settings_returns ON public.seller_settings USING GIN(return_policy);
CREATE INDEX IF NOT EXISTS idx_seller_settings_payments ON public.seller_settings USING GIN(payment_settings);

-- Add constraints for data validation
ALTER TABLE public.seller_settings 
ADD CONSTRAINT check_store_status CHECK (store_status IN ('draft', 'active', 'suspended', 'closed'));

-- Create function to validate shipping settings JSON structure
CREATE OR REPLACE FUNCTION validate_shipping_settings_json(settings JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if all required fields exist
    IF NOT (settings ? 'free_shipping_threshold' AND 
            settings ? 'flat_rate_shipping' AND 
            settings ? 'shipping_zones') THEN
        RETURN FALSE;
    END IF;
    
    -- Check if numeric fields are actually numeric
    IF NOT (jsonb_typeof(settings->'free_shipping_threshold') = 'number' AND
            jsonb_typeof(settings->'flat_rate_shipping') = 'number') THEN
        RETURN FALSE;
    END IF;
    
    -- Check if shipping_zones is an array
    IF NOT (jsonb_typeof(settings->'shipping_zones') = 'array') THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate return policy JSON structure
CREATE OR REPLACE FUNCTION validate_return_policy_json(policy JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if all required fields exist
    IF NOT (policy ? 'accepts_returns' AND 
            policy ? 'return_window_days' AND 
            policy ? 'return_shipping_paid_by' AND 
            policy ? 'return_conditions') THEN
        RETURN FALSE;
    END IF;
    
    -- Check if boolean fields are actually boolean
    IF NOT (jsonb_typeof(policy->'accepts_returns') = 'boolean') THEN
        RETURN FALSE;
    END IF;
    
    -- Check if numeric fields are actually numeric
    IF NOT (jsonb_typeof(policy->'return_window_days') = 'number') THEN
        RETURN FALSE;
    END IF;
    
    -- Check if return_shipping_paid_by has valid value
    IF NOT (policy->>'return_shipping_paid_by' IN ('seller', 'buyer')) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if return_conditions is an array
    IF NOT (jsonb_typeof(policy->'return_conditions') = 'array') THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate payment settings JSON structure
CREATE OR REPLACE FUNCTION validate_payment_settings_json(settings JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if all required fields exist
    IF NOT (settings ? 'stripe_connected' AND 
            settings ? 'stripe_account_id' AND 
            settings ? 'payout_schedule' AND 
            settings ? 'minimum_payout') THEN
        RETURN FALSE;
    END IF;
    
    -- Check if boolean fields are actually boolean
    IF NOT (jsonb_typeof(settings->'stripe_connected') = 'boolean') THEN
        RETURN FALSE;
    END IF;
    
    -- Check if payout_schedule has valid value
    IF NOT (settings->>'payout_schedule' IN ('daily', 'weekly', 'monthly')) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if minimum_payout is numeric
    IF NOT (jsonb_typeof(settings->'minimum_payout') = 'number') THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add constraints using the validation functions
ALTER TABLE public.seller_settings 
ADD CONSTRAINT check_shipping_settings CHECK (validate_shipping_settings_json(shipping_settings)),
ADD CONSTRAINT check_return_policy CHECK (validate_return_policy_json(return_policy)),
ADD CONSTRAINT check_payment_settings CHECK (validate_payment_settings_json(payment_settings));

-- Create a function to update seller settings
CREATE OR REPLACE FUNCTION update_seller_settings(
    user_id_param UUID,
    settings_type TEXT,
    settings_data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    CASE settings_type
        WHEN 'shipping_settings' THEN
            UPDATE public.seller_settings 
            SET shipping_settings = settings_data, updated_at = NOW()
            WHERE user_id = user_id_param;
        WHEN 'return_policy' THEN
            UPDATE public.seller_settings 
            SET return_policy = settings_data, updated_at = NOW()
            WHERE user_id = user_id_param;
        WHEN 'payment_settings' THEN
            UPDATE public.seller_settings 
            SET payment_settings = settings_data, updated_at = NOW()
            WHERE user_id = user_id_param;
        WHEN 'store_info' THEN
            UPDATE public.seller_settings 
            SET 
                store_name = (settings_data->>'store_name'),
                store_description = (settings_data->>'store_description'),
                store_banner_url = (settings_data->>'store_banner_url'),
                store_logo_url = (settings_data->>'store_logo_url'),
                updated_at = NOW()
            WHERE user_id = user_id_param;
        ELSE
            RETURN FALSE;
    END CASE;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_seller_settings(UUID, TEXT, JSONB) TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.seller_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view and update their own seller settings
CREATE POLICY "Users can view own seller settings" ON public.seller_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own seller settings" ON public.seller_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seller settings" ON public.seller_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own seller settings" ON public.seller_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Create a view for public store information
CREATE OR REPLACE VIEW public_store_info AS
SELECT 
    user_id,
    store_name,
    store_description,
    store_banner_url,
    store_logo_url,
    store_status,
    store_verified,
    shipping_settings->>'free_shipping_threshold' as free_shipping_threshold,
    shipping_settings->>'flat_rate_shipping' as flat_rate_shipping,
    return_policy->>'accepts_returns' as accepts_returns,
    return_policy->>'return_window_days' as return_window_days,
    created_at
FROM public.seller_settings
WHERE store_status = 'active' AND store_verified = true;

-- Grant permissions on the view
GRANT SELECT ON public_store_info TO authenticated;

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_seller_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seller_settings_updated_at
    BEFORE UPDATE ON public.seller_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_settings_updated_at();

-- Show summary of changes
SELECT 
    'Seller settings table created successfully' as status,
    'Ready for seller configuration' as next_steps;
