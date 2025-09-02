-- Mentor system schema (profiles, sessions, bookings)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mentor profiles
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  headline text,
  bio text,
  expertise text[],
  hourly_rate numeric(10,2),
  timezone text,
  rating numeric DEFAULT 0,
  total_sessions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Mentor sessions (availability slots mentors publish)
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  capacity integer DEFAULT 1,
  booked_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Bookings by mentees
CREATE TABLE IF NOT EXISTS public.mentor_bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES public.mentor_sessions(id) ON DELETE CASCADE,
  mentee_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending', -- pending | confirmed | cancelled
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, mentee_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON public.mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor_user_id ON public.mentor_sessions(mentor_user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_bookings_session_id ON public.mentor_bookings(session_id);

-- RLS
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Mentor can read own profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Mentor can upsert own profile" ON public.mentor_profiles;
CREATE POLICY "Mentor can read own profile" ON public.mentor_profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Mentor can upsert own profile" ON public.mentor_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Mentor can update own profile" ON public.mentor_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Sessions policies
DROP POLICY IF EXISTS "Public can read sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Mentor can manage own sessions" ON public.mentor_sessions;
CREATE POLICY "Public can read sessions" ON public.mentor_sessions FOR SELECT USING (true);
CREATE POLICY "Mentor can manage own sessions" ON public.mentor_sessions
  USING (mentor_user_id = auth.uid()) WITH CHECK (mentor_user_id = auth.uid());

-- Bookings policies
DROP POLICY IF EXISTS "Mentor and mentee can read bookings" ON public.mentor_bookings;
DROP POLICY IF EXISTS "Mentee can book session" ON public.mentor_bookings;
DROP POLICY IF EXISTS "Mentee can cancel own booking" ON public.mentor_bookings;
DROP POLICY IF EXISTS "Mentor can update status on own sessions" ON public.mentor_bookings;
CREATE POLICY "Mentor and mentee can read bookings" ON public.mentor_bookings
  FOR SELECT USING (
    mentee_user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.mentor_sessions s WHERE s.id = mentor_bookings.session_id AND s.mentor_user_id = auth.uid())
  );
CREATE POLICY "Mentee can book session" ON public.mentor_bookings
  FOR INSERT WITH CHECK (mentee_user_id = auth.uid());
CREATE POLICY "Mentee can cancel own booking" ON public.mentor_bookings
  FOR UPDATE USING (mentee_user_id = auth.uid());
CREATE POLICY "Mentor can update status on own sessions" ON public.mentor_bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.mentor_sessions s
      WHERE s.id = mentor_bookings.session_id AND s.mentor_user_id = auth.uid()
    )
  );

-- Triggers to keep updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$ BEGIN NEW.updated_at := now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_mentor_profiles_updated_at ON public.mentor_profiles;
CREATE TRIGGER trg_mentor_profiles_updated_at BEFORE UPDATE ON public.mentor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- Auto-increment total_sessions when booking becomes confirmed
CREATE OR REPLACE FUNCTION public.increment_total_sessions()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS DISTINCT FROM 'confirmed') THEN
    UPDATE public.mentor_profiles mp
    SET total_sessions = COALESCE(total_sessions, 0) + 1
    FROM public.mentor_sessions ms
    WHERE ms.id = NEW.session_id
      AND mp.user_id = ms.mentor_user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_total_sessions ON public.mentor_bookings;
CREATE TRIGGER trg_increment_total_sessions
AFTER UPDATE ON public.mentor_bookings
FOR EACH ROW EXECUTE FUNCTION public.increment_total_sessions();

-- Notify mentee when mentor changes booking status (confirmed/cancelled)
CREATE OR REPLACE FUNCTION public.notify_mentee_on_status_change()
RETURNS trigger AS $$
DECLARE
  v_title text;
  v_msg text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_title := 'Booking status updated';
    v_msg := 'Your booking status is now ' || NEW.status;
    INSERT INTO public.notifications (user_id, title, message, type, related_id, is_read)
    VALUES (NEW.mentee_user_id, v_title, v_msg, 'system', NEW.session_id, false);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_mentee_on_status_change ON public.mentor_bookings;
CREATE TRIGGER trg_notify_mentee_on_status_change
AFTER UPDATE ON public.mentor_bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_mentee_on_status_change();

-- Notify mentor on booking creation (so mentors see new requests)
CREATE OR REPLACE FUNCTION public.notify_mentor_on_booking()
RETURNS trigger AS $$
DECLARE
  v_mentor uuid;
BEGIN
  SELECT mentor_user_id INTO v_mentor FROM public.mentor_sessions WHERE id = NEW.session_id;
  IF v_mentor IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_id, is_read)
    VALUES (v_mentor, 'New booking request', 'A mentee requested to book your session.', 'booking', NEW.session_id, false);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_mentor_on_booking ON public.mentor_bookings;
CREATE TRIGGER trg_notify_mentor_on_booking
AFTER INSERT ON public.mentor_bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_mentor_on_booking();

