-- Create storage bucket for company logos if not exists
-- Run in Supabase SQL editor

-- Create bucket
select
  case
    when exists (select 1 from storage.buckets where id = 'company-media') then 'bucket exists'
    else (
      select (
        storage.create_bucket('company-media', jsonb_build_object('public', true))
      )
    )
  end;

-- Ensure companies table has logo column
alter table if exists public.companies
  add column if not exists logo text;

-- Simple policy: allow authenticated users to read objects; only owners can write
-- Adjust as needed for your app
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Company media read'
  ) then
    create policy "Company media read" on storage.objects
      for select to authenticated
      using ( bucket_id = 'company-media' );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Company media write own'
  ) then
    create policy "Company media write own" on storage.objects
      for insert to authenticated
      with check ( bucket_id = 'company-media' );
  end if;
end $$;


