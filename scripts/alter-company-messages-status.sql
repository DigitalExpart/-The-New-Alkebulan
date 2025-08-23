-- Add status fields to messages for delivery/read receipts
alter table public.company_messages
  add column if not exists status text check (status in ('sent','delivered','read')),
  add column if not exists delivered_at timestamptz,
  add column if not exists read_at timestamptz;


