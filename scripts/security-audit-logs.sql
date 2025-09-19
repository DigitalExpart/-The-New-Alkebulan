-- Audit log table
create table if not exists public.audit_log (
  id bigserial primary key,
  table_name text not null,
  action text not null,
  actor uuid,
  row_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

-- Helper to write audit
create or replace function public.fn_audit() returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    insert into public.audit_log(table_name, action, actor, row_id, new_data)
    values (TG_TABLE_NAME, TG_OP, auth.uid(), coalesce((new).id, gen_random_uuid()), to_jsonb(new));
    return new;
  elsif (TG_OP = 'UPDATE') then
    insert into public.audit_log(table_name, action, actor, row_id, old_data, new_data)
    values (TG_TABLE_NAME, TG_OP, auth.uid(), coalesce((new).id, (old).id), to_jsonb(old), to_jsonb(new));
    return new;
  elsif (TG_OP = 'DELETE') then
    insert into public.audit_log(table_name, action, actor, row_id, old_data)
    values (TG_TABLE_NAME, TG_OP, auth.uid(), (old).id, to_jsonb(old));
    return old;
  end if;
  return null;
end; $$ language plpgsql security definer;

-- Attach triggers
create trigger trg_audit_mentor_sessions
  after insert or update or delete on public.mentor_sessions
  for each row execute function public.fn_audit();

create trigger trg_audit_mentor_programs
  after insert or update or delete on public.mentor_programs
  for each row execute function public.fn_audit();

create trigger trg_audit_mentor_bookings
  after insert or update or delete on public.mentor_bookings
  for each row execute function public.fn_audit();
