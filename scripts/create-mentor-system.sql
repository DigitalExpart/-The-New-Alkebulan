-- Add price for sessions (idempotent)
ALTER TABLE public.mentor_sessions
  ADD COLUMN IF NOT EXISTS price numeric(10,2) NOT NULL DEFAULT 0;

