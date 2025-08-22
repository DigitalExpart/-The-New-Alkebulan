-- Create business_goals table for storing business goals
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_goals_user_id ON public.business_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_business_goals_category ON public.business_goals(category);
CREATE INDEX IF NOT EXISTS idx_business_goals_status ON public.business_goals(status);
CREATE INDEX IF NOT EXISTS idx_business_goals_deadline ON public.business_goals(deadline);

-- Enable Row Level Security
ALTER TABLE public.business_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own business goals" ON public.business_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business goals" ON public.business_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business goals" ON public.business_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business goals" ON public.business_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_business_goals_updated_at
  BEFORE UPDATE ON public.business_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_business_goals_updated_at();

-- Grant permissions
GRANT ALL ON public.business_goals TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Insert some sample goals for testing (optional)
-- Uncomment the following lines if you want to add sample data
/*
INSERT INTO public.business_goals (user_id, title, description, category, target, current, unit, deadline, status) VALUES
  ('your-user-id-here', 'Increase Monthly Revenue', 'Reach $25,000 in monthly revenue by Q2 2024', 'revenue', 25000, 15000, 'USD', '2024-06-30', 'in_progress'),
  ('your-user-id-here', 'Expand Product Line', 'Launch 10 new products this quarter', 'product', 10, 3, 'products', '2024-03-31', 'in_progress'),
  ('your-user-id-here', 'Customer Acquisition', 'Acquire 100 new customers this month', 'customer', 100, 23, 'customers', '2024-01-31', 'in_progress');
*/
