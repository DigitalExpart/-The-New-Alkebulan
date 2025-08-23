-- Company logos storage table
create table if not exists public.company_logos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  file_path text not null,
  file_name text,
  file_size bigint,
  file_type text,
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

-- Indexes
create index if not exists idx_company_logos_company_id on public.company_logos(company_id);

-- RLS
alter table public.company_logos enable row level security;

-- Allow authenticated users to manage their own company logos
create policy if not exists "company logos read" on public.company_logos
  for select
  to authenticated
  using (true);

-- You can refine this to only allow updates for the owner once ownership is modeled
create policy if not exists "company logos insert" on public.company_logos
  for insert to authenticated
  with check (true);


