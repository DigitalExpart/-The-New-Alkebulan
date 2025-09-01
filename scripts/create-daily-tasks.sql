-- Daily Tasks schema for the Growth > Daily Planner page
-- Run this in Supabase SQL editor. The script is idempotent.

-- Enable UUID extension (Supabase usually has this, but keep idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: public.daily_tasks
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  -- Store task date and time separately to match UI
  task_date date NOT NULL,
  task_time text,
  priority text NOT NULL DEFAULT 'medium', -- low | medium | high
  category text,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id ON public.daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON public.daily_tasks(task_date);

-- RLS
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to make re-runs safe
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.daily_tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.daily_tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.daily_tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.daily_tasks;

-- Policies
CREATE POLICY "Users can view their own tasks"
  ON public.daily_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON public.daily_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.daily_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.daily_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION public.update_daily_tasks_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_daily_tasks_updated_at ON public.daily_tasks;
CREATE TRIGGER trg_update_daily_tasks_updated_at
BEFORE UPDATE ON public.daily_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_daily_tasks_updated_at();


