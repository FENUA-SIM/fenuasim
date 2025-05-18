-- Table des administrateurs
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
); 