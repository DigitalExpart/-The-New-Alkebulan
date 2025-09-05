-- RLS policies to allow only admins to update any profile
-- and allow users to update their own profile.

-- Helper function to check admin based on profiles.is_admin
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT is_admin
      FROM public.profiles p
      WHERE p.id = uid OR p.user_id = uid
      LIMIT 1
    ), false
  );
$$;

-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow all users to read profiles (adjust if you prefer stricter privacy)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view all profiles'
  ) THEN
    CREATE POLICY "Users can view all profiles" ON public.profiles
      FOR SELECT USING (true);
  END IF;
END $$;

-- Allow users to update their own profile
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (id = auth.uid() OR user_id = auth.uid())
      WITH CHECK (id = auth.uid() OR user_id = auth.uid());
  END IF;
END $$;

-- Allow admins to update any profile
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can update any profile'
  ) THEN
    CREATE POLICY "Admins can update any profile" ON public.profiles
      FOR UPDATE USING (public.is_admin(auth.uid()))
      WITH CHECK (true);
  END IF;
END $$;


