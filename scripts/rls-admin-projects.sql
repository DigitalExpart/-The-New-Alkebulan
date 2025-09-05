-- Allow admins to manage all projects; users can see active projects

-- Ensure RLS enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public read for active projects
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND policyname='Public can view active projects'
  ) THEN
    CREATE POLICY "Public can view active projects" ON public.projects
      FOR SELECT USING (status = 'active');
  END IF;
END $$;

-- Authors can manage their own projects
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND policyname='Authors can manage own projects'
  ) THEN
    CREATE POLICY "Authors can manage own projects" ON public.projects
      FOR ALL USING (author_id = auth.uid())
      WITH CHECK (author_id = auth.uid());
  END IF;
END $$;

-- Admins can manage any project
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND policyname='Admins can manage projects'
  ) THEN
    CREATE POLICY "Admins can manage projects" ON public.projects
      FOR ALL USING (public.is_admin(auth.uid()))
      WITH CHECK (true);
  END IF;
END $$;


