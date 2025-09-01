-- Progress Goals schema for Growth > Progress page
-- Idempotent and safe to run multiple times

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.progress_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target numeric NOT NULL,
  current numeric NOT NULL DEFAULT 0,
  unit text,
  deadline date,
  category text,
  status text NOT NULL DEFAULT 'on-track', -- on-track | behind | completed
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_progress_goals_user_id ON public.progress_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_goals_deadline ON public.progress_goals(deadline);

ALTER TABLE public.progress_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress goals" ON public.progress_goals;
DROP POLICY IF EXISTS "Users can insert own progress goals" ON public.progress_goals;
DROP POLICY IF EXISTS "Users can update own progress goals" ON public.progress_goals;
DROP POLICY IF EXISTS "Users can delete own progress goals" ON public.progress_goals;

CREATE POLICY "Users can view own progress goals"
  ON public.progress_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress goals"
  ON public.progress_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress goals"
  ON public.progress_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress goals"
  ON public.progress_goals FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_progress_goals_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_progress_goals_updated_at ON public.progress_goals;
CREATE TRIGGER trg_update_progress_goals_updated_at
BEFORE UPDATE ON public.progress_goals
FOR EACH ROW EXECUTE FUNCTION public.update_progress_goals_updated_at();


