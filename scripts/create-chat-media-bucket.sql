-- Public bucket for chat media
insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

-- Public read
create policy if not exists "chat-media read"
on storage.objects for select using (bucket_id = 'chat-media');

-- Authenticated write
create policy if not exists "chat-media write"
on storage.objects for insert to authenticated with check (bucket_id = 'chat-media');

create policy if not exists "chat-media update own"
on storage.objects for update to authenticated
using (bucket_id = 'chat-media' and owner = auth.uid())
with check (bucket_id = 'chat-media' and owner = auth.uid());

create policy if not exists "chat-media delete own"
on storage.objects for delete to authenticated
using (bucket_id = 'chat-media' and owner = auth.uid());


