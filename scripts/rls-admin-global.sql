-- Global admin RLS policies for moderation

-- Helper function (idempotent)
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles p WHERE p.id = uid OR p.user_id = uid LIMIT 1),
    false
  );
$$;

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Admin policies (idempotent creates)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='posts' AND policyname='Admins manage posts'
  ) THEN
    CREATE POLICY "Admins manage posts" ON public.posts
      FOR ALL USING (public.is_admin(auth.uid()))
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='communities' AND policyname='Admins manage communities'
  ) THEN
    CREATE POLICY "Admins manage communities" ON public.communities
      FOR ALL USING (public.is_admin(auth.uid()))
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_items' AND policyname='Admins manage marketplace items'
  ) THEN
    CREATE POLICY "Admins manage marketplace items" ON public.marketplace_items
      FOR ALL USING (public.is_admin(auth.uid()))
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Admins manage products'
  ) THEN
    CREATE POLICY "Admins manage products" ON public.products
      FOR ALL USING (public.is_admin(auth.uid()))
      WITH CHECK (true);
  END IF;
END $$;


