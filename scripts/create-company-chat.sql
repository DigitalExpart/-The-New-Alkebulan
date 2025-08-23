-- Conversations between a user and a company
create table if not exists public.company_conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_message text,
  last_message_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.company_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.company_conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('user','company')),
  sender_id uuid not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.company_conversations enable row level security;
alter table public.company_messages enable row level security;

-- Policies: allow any authenticated user to read/write their own conversations
create policy if not exists "conv-select"
on public.company_conversations for select to authenticated
using (user_id = auth.uid());

create policy if not exists "conv-insert"
on public.company_conversations for insert to authenticated
with check (user_id = auth.uid());

create policy if not exists "msg-select"
on public.company_messages for select to authenticated
using (
  exists (
    select 1 from public.company_conversations c
    where c.id = company_messages.conversation_id and c.user_id = auth.uid()
  )
);

create policy if not exists "msg-insert"
on public.company_messages for insert to authenticated
with check (
  exists (
    select 1 from public.company_conversations c
    where c.id = company_messages.conversation_id and c.user_id = auth.uid()
  )
);

create index if not exists company_messages_conversation_id_idx on public.company_messages(conversation_id);
create index if not exists company_conversations_company_id_user_id_idx on public.company_conversations(company_id, user_id);


