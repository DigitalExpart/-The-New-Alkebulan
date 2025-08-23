-- Extend company_messages with media support
alter table public.company_messages
  add column if not exists media_url text,
  add column if not exists media_type text check (media_type in ('image','video','audio','file')),
  add column if not exists media_thumb text,
  add column if not exists media_name text,
  add column if not exists media_size bigint,
  add column if not exists media_duration integer; -- seconds for audio/video


