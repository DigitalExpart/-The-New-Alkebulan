-- Table for user-submitted project requests (contact support)
create table if not exists public.project_requests (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  title text not null,
  category text,
  budget numeric,
  description text,
  status text default 'new',
  created_at timestamp with time zone default now()
);

alter table public.project_requests enable row level security;

-- Anyone authenticated can insert a request
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='project_requests' and policyname='Users can create requests'
  ) then
    create policy "Users can create requests" on public.project_requests
      for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Admins can view and manage requests
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='project_requests' and policyname='Admins manage project requests'
  ) then
    create policy "Admins manage project requests" on public.project_requests
      for all using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;
end $$;


