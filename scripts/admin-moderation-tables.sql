-- Admin Moderation Tables and Columns (idempotent)
-- This script creates minimal tables/columns used by the admin dashboard.

-- 1) Add suspension fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_suspended'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_suspended BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'suspended_until'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN suspended_until TIMESTAMPTZ;
  END IF;
END $$;

-- 2) Ensure companies has verification/suspension flags
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'verified'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN verified BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'suspended'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN suspended BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 3) Ensure products/items have status for moderation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='products') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='status'
    ) THEN
      ALTER TABLE public.products ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='marketplace_items') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='marketplace_items' AND column_name='status'
    ) THEN
      ALTER TABLE public.marketplace_items ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
  END IF;
END $$;

-- 4) Reports table for posts/comments/communities/products
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('post','comment','community','product','profile')),
  target_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','action_taken','dismissed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_type, target_id);

-- 5) Conversation reports (abuse in chat)
CREATE TABLE IF NOT EXISTS public.conversation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id UUID,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','action_taken','dismissed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_conversation_reports_conv ON public.conversation_reports(conversation_id);

-- 6) KYC/AML documents (optional)
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('profile','company')),
  owner_id UUID NOT NULL,
  doc_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_kyc_owner ON public.kyc_documents(owner_type, owner_id);

-- 7) Basic RLS (allow owners to read their own docs; admins via service role)
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='kyc_documents' AND policyname='KYC owner can read'
  ) THEN
    CREATE POLICY "KYC owner can read" ON public.kyc_documents
      FOR SELECT USING (
        (owner_type = 'profile' AND owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
      );
  END IF;
END $$;

-- 8) Payment events helper table (if not already created elsewhere)
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT,
  event_type TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9) Helper view for reported content counts (optional)
CREATE VIEW IF NOT EXISTS public.report_counts AS
SELECT target_type, count(*) AS total
FROM public.reports
GROUP BY target_type;


