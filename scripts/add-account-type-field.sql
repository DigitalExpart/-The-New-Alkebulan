-- Add Account Type Field to Profiles Table
-- This script adds an account_type field to distinguish between buyer and seller accounts

-- Add account_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'buyer' CHECK (account_type IN ('buyer', 'seller'));

-- Create index for better performance on account type queries
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);

-- Update existing profiles to have 'buyer' as default account type
UPDATE public.profiles 
SET account_type = 'buyer' 
WHERE account_type IS NULL;

-- Add RLS policy for account type visibility
-- Users can see other users' account types for marketplace functionality
CREATE POLICY "Users can view account types for marketplace" ON public.profiles
  FOR SELECT USING (true);

-- Create a view for marketplace users (buyers and sellers)
CREATE OR REPLACE VIEW marketplace_users AS
SELECT 
  id,
  user_id,
  full_name,
  email,
  account_type,
  avatar_url,
  location,
  occupation,
  created_at,
  -- Only show email if user has public profile
  CASE 
    WHEN is_public = true THEN email 
    ELSE NULL 
  END as public_email
FROM public.profiles
WHERE account_type IS NOT NULL;

-- Grant permissions on the view
GRANT SELECT ON marketplace_users TO authenticated;

-- Show summary of changes
SELECT 
  'Account type field added successfully' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN account_type = 'buyer' THEN 1 END) as buyer_accounts,
  COUNT(CASE WHEN account_type = 'seller' THEN 1 END) as seller_accounts
FROM public.profiles;
