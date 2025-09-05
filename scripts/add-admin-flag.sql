-- Add a simple global admin flag on profiles
-- Run in Supabase SQL editor

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Optional: create an index if you will frequently filter by admin
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Example: promote a specific user to admin (replace UUID)
-- UPDATE public.profiles SET is_admin = true, updated_at = NOW() WHERE user_id = '00000000-0000-0000-0000-000000000000';


