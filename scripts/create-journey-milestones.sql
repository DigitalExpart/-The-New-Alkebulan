-- Journey Milestones schema for Growth > Journey page (idempotent)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.journey_milestones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  milestone_date date NOT NULL,
  category text,
  status text NOT NULL DEFAULT 'planned', -- completed | in-progress | planned
  impact text NOT NULL DEFAULT 'medium',  -- low | medium | high
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journey_milestones_user_id ON public.journey_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_milestones_date ON public.journey_milestones(milestone_date);

ALTER TABLE public.journey_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own milestones" ON public.journey_milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON public.journey_milestones;
DROP POLICY IF EXISTS "Users can update own milestones" ON public.journey_milestones;
DROP POLICY IF EXISTS "Users can delete own milestones" ON public.journey_milestones;

CREATE POLICY "Users can view own milestones"
  ON public.journey_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON public.journey_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON public.journey_milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones"
  ON public.journey_milestones FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_journey_milestones_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_journey_milestones_updated_at ON public.journey_milestones;
CREATE TRIGGER trg_update_journey_milestones_updated_at
BEFORE UPDATE ON public.journey_milestones
FOR EACH ROW EXECUTE FUNCTION public.update_journey_milestones_updated_at();


