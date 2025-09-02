-- Learning Hub: per-user courses with progress (idempotent)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.learning_courses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  duration text,
  difficulty text NOT NULL DEFAULT 'beginner', -- beginner | intermediate | advanced
  rating numeric NOT NULL DEFAULT 0,
  enrolled integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'not-started', -- not-started | in-progress | completed
  progress integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_courses_user_id ON public.learning_courses(user_id);

ALTER TABLE public.learning_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own courses" ON public.learning_courses;
DROP POLICY IF EXISTS "Users can insert own courses" ON public.learning_courses;
DROP POLICY IF EXISTS "Users can update own courses" ON public.learning_courses;
DROP POLICY IF EXISTS "Users can delete own courses" ON public.learning_courses;

CREATE POLICY "Users can view own courses"
  ON public.learning_courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own courses"
  ON public.learning_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses"
  ON public.learning_courses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses"
  ON public.learning_courses FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_learning_courses_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_learning_courses_updated_at ON public.learning_courses;
CREATE TRIGGER trg_update_learning_courses_updated_at
BEFORE UPDATE ON public.learning_courses
FOR EACH ROW EXECUTE FUNCTION public.update_learning_courses_updated_at();


