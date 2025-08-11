-- Add account_type column to profiles table if it doesn't exist
-- This script is safe to run multiple times

-- Check if the column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'account_type'
    ) THEN
        -- Add the account_type column
        ALTER TABLE public.profiles 
        ADD COLUMN account_type TEXT DEFAULT 'buyer' CHECK (account_type IN ('buyer', 'seller'));
        
        -- Create an index for better performance
        CREATE INDEX idx_profiles_account_type ON public.profiles(account_type);
        
        -- Update existing profiles to have 'buyer' as default
        UPDATE public.profiles 
        SET account_type = 'buyer' 
        WHERE account_type IS NULL;
        
        RAISE NOTICE 'account_type column added successfully';
    ELSE
        RAISE NOTICE 'account_type column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'account_type';

-- Show current account types
SELECT 
    account_type, 
    COUNT(*) as count
FROM public.profiles 
GROUP BY account_type;
