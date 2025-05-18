create table public.forfaits (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  description text not null,
  data text not null,
  data_value integer not null,
  duree text not null,
  duree_value integer not null,
  prix decimal(10,2) not null,
  region text not null,
  popularite integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activer RLS (Row Level Security)
alter table public.forfaits enable row level security;

-- Créer une politique pour permettre la lecture publique
create policy "Allow public read access"
  on public.forfaits
  for select
  to public
  using (true);

-- Créer une politique pour permettre l'insertion/modification uniquement aux administrateurs
create policy "Allow admin write access"
  on public.forfaits
  for all
  to authenticated
  using (auth.uid() in (select user_id from public.admins))
  with check (auth.uid() in (select user_id from public.admins));

-- Insérer les données initiales
insert into public.forfaits (nom, description, data, data_value, duree, duree_value, prix, region, popularite)
values
  ('Forfait Polynésie', 'Forfait data pour la Polynésie française', '10 Go', 10, '30 jours', 30, 29.99, 'Polynésie', 5),
  ('Forfait Pacifique', 'Forfait data pour le Pacifique Sud', '20 Go', 20, '30 jours', 30, 39.99, 'Pacifique', 4),
  ('Forfait International', 'Forfait data international', '50 Go', 50, '30 jours', 30, 49.99, 'International', 3),
  ('Forfait Polynésie Premium', 'Forfait data premium pour la Polynésie française', '30 Go', 30, '30 jours', 30, 44.99, 'Polynésie', 5),
  ('Forfait Pacifique Plus', 'Forfait data étendu pour le Pacifique Sud', '40 Go', 40, '30 jours', 30, 54.99, 'Pacifique', 4); 