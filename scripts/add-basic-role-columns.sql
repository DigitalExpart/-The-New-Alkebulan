-- Simple script to add basic role columns
-- Run this first to test the role switching

-- Add buyer_enabled column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS buyer_enabled BOOLEAN DEFAULT true;

-- Add seller_enabled column  
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS seller_enabled BOOLEAN DEFAULT false;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_buyer_enabled ON public.profiles(buyer_enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_seller_enabled ON public.profiles(seller_enabled);

-- Set default values for existing profiles
UPDATE public.profiles 
SET buyer_enabled = true, seller_enabled = false 
WHERE buyer_enabled IS NULL OR seller_enabled IS NULL;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('buyer_enabled', 'seller_enabled');

-- Show current data
SELECT 
    id,
    buyer_enabled,
    seller_enabled
FROM public.profiles 
LIMIT 5;
