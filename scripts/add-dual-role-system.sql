-- Add dual-role system to profiles table
-- This script adds buyer_enabled and seller_enabled columns for flexible role management

-- Check if the columns already exist
DO $$ 
BEGIN
    -- Add buyer_enabled column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'buyer_enabled'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN buyer_enabled BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'buyer_enabled column added successfully';
    ELSE
        RAISE NOTICE 'buyer_enabled column already exists';
    END IF;
    
    -- Add seller_enabled column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'seller_enabled'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN seller_enabled BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'seller_enabled column added successfully';
    ELSE
        RAISE NOTICE 'seller_enabled column already exists';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_buyer_enabled ON public.profiles(buyer_enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_seller_enabled ON public.profiles(seller_enabled);

-- Update existing profiles to have appropriate default roles
-- If they had account_type = 'seller', enable seller role
UPDATE public.profiles 
SET seller_enabled = true 
WHERE account_type = 'seller' AND seller_enabled IS NULL;

-- If they had account_type = 'buyer' or NULL, ensure buyer is enabled
UPDATE public.profiles 
SET buyer_enabled = true 
WHERE (account_type = 'buyer' OR account_type IS NULL) AND buyer_enabled IS NULL;

-- Add check constraints to ensure at least one role is enabled
ALTER TABLE public.profiles 
ADD CONSTRAINT check_at_least_one_role 
CHECK (buyer_enabled = true OR seller_enabled = true);

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('buyer_enabled', 'seller_enabled');

-- Show current role distribution
SELECT 
    buyer_enabled,
    seller_enabled,
    COUNT(*) as count
FROM public.profiles 
GROUP BY buyer_enabled, seller_enabled
ORDER BY buyer_enabled, seller_enabled;

-- Show migration summary
SELECT 
    'Migration Summary' as info,
    COUNT(*) as total_profiles,
    SUM(CASE WHEN buyer_enabled THEN 1 ELSE 0 END) as buyer_enabled_count,
    SUM(CASE WHEN seller_enabled THEN 1 ELSE 0 END) as seller_enabled_count,
    SUM(CASE WHEN buyer_enabled AND seller_enabled THEN 1 ELSE 0 END) as dual_role_count
FROM public.profiles;
