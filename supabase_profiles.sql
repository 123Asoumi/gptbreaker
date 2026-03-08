-- Activer l'extension pgcrypto pour générer des UUID si nécessaire
create extension if not exists pgcrypto;

-- Créer la table 'profiles'
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activer Row Level Security pour garantir que chacun ne voit que son propre profil
alter table public.profiles enable row level security;

create policy "Les utilisateurs peuvent voir leur propre profil."
  on profiles for select
  using ( auth.uid() = id );

create policy "Les utilisateurs peuvent mettre à jour leur propre profil."
  on profiles for update
  using ( auth.uid() = id );

-- Définir un déclencheur (trigger) pour insérer automatiquement une ligne 
-- dans 'public.profiles' chaque fois qu'un utilisateur s'inscrit dans auth.users
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Attacher le déclencheur à la table auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
