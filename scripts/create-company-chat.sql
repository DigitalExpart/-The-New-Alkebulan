-- Create the company_conversations table
CREATE TABLE IF NOT EXISTS public.company_conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE, -- Assuming a businesses table exists
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (company_id, user_id)
);

-- Create index on company_id and user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_conversations_company_id ON public.company_conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_conversations_user_id ON public.company_conversations(user_id);

-- Create the company_messages table
CREATE TABLE IF NOT EXISTS public.company_messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL REFERENCES public.company_conversations(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Can be user or company rep
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_from_company BOOLEAN DEFAULT FALSE -- true if sender is a company representative
);

-- Create index on conversation_id for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_company_messages_conversation_id ON public.company_messages(conversation_id);

-- Enable Row Level Security (RLS) for company_conversations
ALTER TABLE public.company_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for participants" ON public.company_conversations;
CREATE POLICY "Enable read access for participants" ON public.company_conversations
FOR SELECT USING (
  (auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM public.business_profiles WHERE business_id = company_id AND profile_id = auth.uid())) -- Assuming business_profiles links users to companies
);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.company_conversations;
CREATE POLICY "Enable insert for authenticated users" ON public.company_conversations
FOR INSERT WITH CHECK ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM public.business_profiles WHERE business_id = company_id AND profile_id = auth.uid())));

-- Enable RLS for company_messages
ALTER TABLE public.company_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for participants" ON public.company_messages;
CREATE POLICY "Enable read access for participants" ON public.company_messages
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.company_conversations WHERE id = conversation_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.company_conversations cc JOIN public.business_profiles bp ON cc.company_id = bp.business_id WHERE cc.id = conversation_id AND bp.profile_id = auth.uid())
);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.company_messages;
CREATE POLICY "Enable insert for authenticated users" ON public.company_messages
FOR INSERT WITH CHECK (
  (auth.uid() = sender_id AND is_from_company = FALSE AND EXISTS (SELECT 1 FROM public.company_conversations WHERE id = conversation_id AND user_id = auth.uid())) OR
  (is_from_company = TRUE AND EXISTS (SELECT 1 FROM public.company_conversations cc JOIN public.business_profiles bp ON cc.company_id = bp.business_id WHERE cc.id = conversation_id AND bp.profile_id = auth.uid()))
);


