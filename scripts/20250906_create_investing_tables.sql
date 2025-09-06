-- Investments schema for My Investments
-- Idempotent guards
do $$ begin
  create type investment_status as enum ('active','closed','pending','cancelled');
exception when duplicate_object then null; end $$;

-- Core tables
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investment_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  investment_id uuid not null references public.investments(id) on delete cascade,
  invested_amount numeric(14,2) not null default 0,
  current_value numeric(14,2) not null default 0,
  return_rate numeric(6,2) not null default 0,
  status investment_status not null default 'active',
  start_date date,
  end_date date,
  progress integer not null default 0,
  last_update timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  investment_id uuid references public.investments(id) on delete set null,
  type text not null check (type in ('investment','return','fee','adjustment')),
  amount numeric(14,2) not null,
  occurred_at timestamptz not null default now(),
  status text not null default 'completed',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Helpful views
create or replace view public.v_investment_portfolio_stats as
select
  user_id,
  coalesce(sum(invested_amount),0)::numeric(14,2) as total_invested,
  coalesce(sum(current_value),0)::numeric(14,2) as total_value,
  coalesce(sum(current_value - invested_amount),0)::numeric(14,2) as total_returns,
  case when coalesce(sum(invested_amount),0) = 0 then 0
       else round((coalesce(sum(current_value),0) - coalesce(sum(invested_amount),0))
             / nullif(sum(invested_amount),0) * 100, 2) end as avg_return_rate
from public.investment_positions
group by user_id;

-- RLS
alter table public.investments enable row level security;
alter table public.investment_positions enable row level security;
alter table public.investment_transactions enable row level security;

do $$ begin
  create policy "Investments are viewable by owner" on public.investments
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Investments are insertable by owner" on public.investments
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Investments are updatable by owner" on public.investments
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Positions viewable by owner" on public.investment_positions
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Positions insertable by owner" on public.investment_positions
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Positions updatable by owner" on public.investment_positions
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Transactions viewable by owner" on public.investment_transactions
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Transactions insertable by owner" on public.investment_transactions
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Indexes
create index if not exists idx_positions_user on public.investment_positions(user_id);
create index if not exists idx_transactions_user on public.investment_transactions(user_id);
create index if not exists idx_positions_investment on public.investment_positions(investment_id);
create index if not exists idx_transactions_investment on public.investment_transactions(investment_id);


