-- Enable Row Level Security and define policies for mentor-related tables

-- mentor_sessions: auth-only read; only owners (mentor_user_id) can insert/update/delete
alter table if exists public.mentor_sessions enable row level security;

drop policy if exists mentor_sessions_select_public on public.mentor_sessions;

create policy if not exists mentor_sessions_select_auth on public.mentor_sessions
for select using (auth.uid() is not null);

create policy if not exists mentor_sessions_modify_owner on public.mentor_sessions
for all using (auth.uid() = mentor_user_id) with check (auth.uid() = mentor_user_id);

-- mentor_programs: only owners read/write their programs; admins can access all (role via JWT claim 'role')
alter table if exists public.mentor_programs enable row level security;

create policy if not exists mentor_programs_select_owner on public.mentor_programs
for select using (auth.uid() = mentor_user_id or (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'admin');

create policy if not exists mentor_programs_modify_owner on public.mentor_programs
for all using (auth.uid() = mentor_user_id or (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'admin')
with check (auth.uid() = mentor_user_id or (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'admin');

-- mentor_bookings: users can read their own bookings; mentors can read bookings for their sessions; admins all
alter table if exists public.mentor_bookings enable row level security;

create policy if not exists mentor_bookings_select_user on public.mentor_bookings
for select using (
  user_id = auth.uid()
  or (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'admin'
);

create policy if not exists mentor_bookings_select_mentor on public.mentor_bookings
for select using (
  exists (
    select 1 from public.mentor_sessions s
    where s.id = mentor_session_id and s.mentor_user_id = auth.uid()
  )
);

create policy if not exists mentor_bookings_insert_user on public.mentor_bookings
for insert with check (user_id = auth.uid());

create policy if not exists mentor_bookings_update_owner on public.mentor_bookings
for update using (user_id = auth.uid());
