-- Add Missing Role Columns
-- This will ensure all role columns exist in the profiles table

-- Step 1: Add missing role columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS creator_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS investor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mentor_enabled BOOLEAN DEFAULT false;

-- Step 2: Set default values for existing profiles
UPDATE public.profiles SET
    creator_enabled = COALESCE(creator_enabled, false),
    investor_enabled = COALESCE(investor_enabled, false),
    mentor_enabled = COALESCE(mentor_enabled, false)
WHERE creator_enabled IS NULL 
   OR investor_enabled IS NULL 
   OR mentor_enabled IS NULL;

-- Step 3: Verify the columns exist
SELECT 
    'Columns Added:' as info
UNION ALL
SELECT 'Creator Enabled: ' || creator_enabled
UNION ALL
SELECT 'Investor Enabled: ' || investor_enabled
UNION ALL
SELECT 'Mentor Enabled: ' || mentor_enabled
FROM public.profiles 
WHERE user_id = '41c785f0-63c7-4f25-9727-84550e28bfb2';
