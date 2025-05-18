-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create orders table avec customer_esim_id
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  customer_esim_id uuid references customer_esims(id),
  status text not null check (status in ('pending', 'completed', 'failed')),
  total_amount decimal(10,2) not null,
  currency text not null default 'EUR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.orders enable row level security;

-- Create policies
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own orders"
  on public.orders for update
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_customer_esim_id_idx on public.orders(customer_esim_id);
create index if not exists orders_status_idx on public.orders(status); 