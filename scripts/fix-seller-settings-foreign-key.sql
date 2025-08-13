-- Fix Seller Settings Table Foreign Key Constraint
-- Run this in your Supabase SQL Editor

-- First, let's check the current foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'seller_settings';

-- Drop the incorrect foreign key constraint
ALTER TABLE public.seller_settings 
DROP CONSTRAINT IF EXISTS seller_settings_user_id_fkey;

-- Add the correct foreign key constraint to reference profiles table
ALTER TABLE public.seller_settings 
ADD CONSTRAINT seller_settings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Verify the constraint was created correctly
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'seller_settings';

-- Now let's try to create default seller settings for existing seller profiles
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
    'Foreign key constraint fixed successfully!' as status,
    COUNT(*) as total_seller_settings,
    'seller_settings' as table_name
FROM public.seller_settings;
