-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create user_sims table
create table if not exists public.user_sims (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  iccid text not null unique,
  name text not null,
  status text not null check (status in ('active', 'inactive', 'suspended')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies for user_sims
alter table public.user_sims enable row level security;

create policy "Users can view their own SIMs"
  on public.user_sims for select
  using (auth.uid() = user_id);

create policy "Users can create their own SIMs"
  on public.user_sims for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own SIMs"
  on public.user_sims for update
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists user_sims_user_id_idx on public.user_sims(user_id);
create index if not exists user_sims_iccid_idx on public.user_sims(iccid); 