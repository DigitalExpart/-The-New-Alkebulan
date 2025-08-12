-- Add missing profile columns - Simple version
-- Run this first to add the missing columns

-- 1. Add missing columns for account management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'buyer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
