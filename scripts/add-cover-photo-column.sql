-- Add cover_photo_url column to profiles table
-- Run this script in your Supabase SQL Editor

-- Check if cover_photo_url column exists, if not add it
DO $$ 
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'cover_photo_url'
        AND table_schema = 'public'
    ) THEN
        -- Add the cover_photo_url column
        ALTER TABLE public.profiles 
        ADD COLUMN cover_photo_url TEXT;
        
        -- Add comment for documentation
        COMMENT ON COLUMN public.profiles.cover_photo_url IS 'URL of the user''s cover photo uploaded to storage';
        
        RAISE NOTICE 'cover_photo_url column added to profiles table';
    ELSE
        RAISE NOTICE 'cover_photo_url column already exists in profiles table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public' 
AND column_name = 'cover_photo_url';
