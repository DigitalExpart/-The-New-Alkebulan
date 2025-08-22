-- Quick setup script for business_goals table
-- Run this in your Supabase SQL editor if the table doesn't exist

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.business_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'revenue',
  target DECIMAL(15,2) NOT NULL,
  current DECIMAL(15,2) DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT 'USD',
  deadline DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.business_goals ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy (allow all authenticated users for now)
DROP POLICY IF EXISTS "Allow authenticated users" ON public.business_goals;
CREATE POLICY "Allow authenticated users" ON public.business_goals
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON public.business_goals TO authenticated;

-- Verify the table was created
SELECT 'Table created successfully' as status, 
       COUNT(*) as row_count 
FROM public.business_goals;
