-- FLOCK OS schema for Supabase (Postgres)
-- Run this whole file once in: Supabase Dashboard -> SQL Editor -> New query
-- Every table has owner_id (defaults to the logged-in user) and an RLS policy
-- so each user can only see and change their own rows.

create extension if not exists pgcrypto;

-- ============ TABLES ============

create table public.farms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  name text not null,
  location text not null default '',
  contact_number text not null default '',
  status text not null default 'active' check (status in ('active','inactive'))
);

create table public.sheds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  capacity integer not null default 0
);

create table public.flocks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  flock_number text not null,
  farm_id uuid not null references public.farms(id) on delete cascade,
  shed_id uuid not null references public.sheds(id) on delete restrict,
  breed text not null,
  supplier text not null default '',
  initial_birds integer not null check (initial_birds > 0),
  placement_date date not null,
  target_age_days integer not null default 38,
  target_weight_kg numeric not null default 2.2,
  status text not null default 'active' check (status in ('active','completed','culled')),
  closure_date date,
  closure_notes text,
  doc_weight_per_chick_grams numeric not null default 42,
  avg_chick_weight_placement_grams numeric not null default 42
  -- NOTE: current_birds is NOT stored. The app calculates it from daily records + sales.
);

create table public.daily_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  flock_id uuid not null references public.flocks(id) on delete cascade,
  date date not null,
  day_number integer not null,
  opening_birds integer not null,
  mortality integer not null default 0,
  culling integer not null default 0,
  sales_count integer not null default 0,
  closing_birds integer not null,
  feed_used_kg numeric not null default 0,
  feed_type text not null,
  feed_bags numeric not null default 0,
  avg_weight_grams numeric,
  medication_given text,
  medication_dose text,
  medication_purpose text,
  vaccine_given text,
  vaccine_status text,
  notes text
);

create table public.weekly_weights (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  flock_id uuid not null references public.flocks(id) on delete cascade,
  week_number integer not null,
  date date not null,
  birds_sampled_count integer not null default 0,
  sample_weights_grams numeric[] not null default '{}',
  average_weight_grams numeric not null default 0,
  average_weight_kg numeric not null default 0,
  target_weight_grams numeric not null default 0,
  target_difference_grams numeric not null default 0,
  is_goal_achieved boolean not null default false,
  weight_gain_per_bird_grams numeric not null default 0,
  live_birds_at_weighing integer not null default 0,
  total_flock_weight_gain_kg numeric not null default 0,
  feed_consumed_this_week_kg numeric not null default 0,
  weekly_fcr numeric not null default 0,
  notes text,
  unique (flock_id, week_number)
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  flock_id uuid not null references public.flocks(id) on delete cascade,
  invoice_no text not null,
  date date not null,
  customer_name text not null,
  market_rate_per_kg numeric not null default 0,
  total_weight_sold_kg numeric not null default 0,
  birds_sold integer not null default 0,
  final_rate_per_kg numeric not null default 0,
  total_amount numeric not null default 0,
  rate_difference_per_kg numeric not null default 0,
  total_rate_difference numeric not null default 0,
  avg_weight_per_bird_kg numeric not null default 0,
  amount_paid numeric not null default 0,
  outstanding_balance numeric not null default 0,
  payment_status text not null default 'unpaid' check (payment_status in ('paid','partial','unpaid')),
  vehicle_number text,
  remarks text
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  flock_id uuid references public.flocks(id) on delete cascade,   -- null = farm-level expense
  farm_id uuid not null references public.farms(id) on delete cascade,
  date date not null,
  category text not null,
  description text not null default '',
  quantity numeric,
  unit text,
  unit_price_pkr numeric,
  total_amount_pkr numeric not null default 0,
  payment_mode text not null default 'Cash',
  vendor_name text
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  name text not null,
  shop_or_business text not null default '',
  city text not null default '',
  phone text not null default '',
  current_balance_pkr numeric not null default 0
);

create table public.vaccinations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  flock_id uuid not null references public.flocks(id) on delete cascade,
  day_age integer not null,
  vaccine_name text not null,
  route text not null,
  disease_target text not null default '',
  scheduled_date date not null,
  status text not null default 'pending' check (status in ('pending','completed','skipped')),
  administered_date date,
  administered_by text
);

-- ============ INDEXES (speed up "all rows for this flock") ============
create index on public.sheds (farm_id);
create index on public.flocks (farm_id);
create index on public.daily_records (flock_id, date);
create index on public.weekly_weights (flock_id);
create index on public.sales (flock_id, date);
create index on public.expenses (flock_id);
create index on public.expenses (farm_id);
create index on public.vaccinations (flock_id);

-- ============ ROW LEVEL SECURITY ============
-- One policy per table: you can only touch rows where owner_id = your user id.
do $$
declare t text;
begin
  foreach t in array array[
    'farms','sheds','flocks','daily_records','weekly_weights',
    'sales','expenses','customers','vaccinations'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "owner full access" on public.%I
         for all to authenticated
         using (owner_id = auth.uid())
         with check (owner_id = auth.uid())', t);
  end loop;
end $$;
