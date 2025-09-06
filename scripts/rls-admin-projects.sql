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

-- Authors can view active projects (creation restricted to admins)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND policyname='Authors can view active projects'
  ) THEN
    CREATE POLICY "Authors can view active projects" ON public.projects
      FOR SELECT USING (status = 'active');
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

-- Restrict INSERT to admins only (explicit insert policy)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND policyname='Admins can create projects'
  ) THEN
    CREATE POLICY "Admins can create projects" ON public.projects
      FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;


