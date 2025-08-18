-- Fix Communities Table Structure
-- Add missing columns to existing communities table

-- Step 1: Add missing columns
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 1000;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS rules TEXT;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Make category required
ALTER TABLE public.communities ALTER COLUMN category SET NOT NULL;

-- Step 3: Update existing records with default values
UPDATE public.communities 
SET 
    category = COALESCE(category, 'General'),
    location = COALESCE(location, 'Global'),
    is_public = COALESCE(is_public, true),
    max_members = COALESCE(max_members, 1000),
    tags = COALESCE(tags, ARRAY['General']),
    member_count = COALESCE(member_count, 0),
    status = COALESCE(status, 'active')
WHERE category IS NULL;

-- Step 4: Verify the fix
SELECT 
    'Communities table structure fixed!' as message,
    COUNT(*) as total_communities
FROM public.communities;

-- Step 5: Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'communities'
ORDER BY ordinal_position;
