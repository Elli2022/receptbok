create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  username text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  owner_name text not null default '',
  name text not null,
  description text not null default '',
  portions text not null default '',
  category text not null default 'Okategoriserat',
  ingredients text[] not null default '{}',
  instructions text[] not null default '{}',
  image text not null default '',
  source_image text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorite_recipes (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create index if not exists recipes_created_at_idx on public.recipes (created_at desc);
create index if not exists favorite_recipes_user_created_idx on public.favorite_recipes (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
before update on public.recipes
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, username)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), 'Receptvän'),
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), 'user_' || substr(new.id::text, 1, 8))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.favorite_recipes enable row level security;

drop policy if exists "Alla kan läsa publika profiler" on public.profiles;
create policy "Alla kan läsa publika profiler"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "Användare kan skapa sin profil" on public.profiles;
create policy "Användare kan skapa sin profil"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Användare kan ändra sin profil" on public.profiles;
create policy "Användare kan ändra sin profil"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Alla kan läsa recept" on public.recipes;
create policy "Alla kan läsa recept"
on public.recipes
for select
to anon, authenticated
using (true);

drop policy if exists "Inloggade kan publicera egna recept" on public.recipes;
create policy "Inloggade kan publicera egna recept"
on public.recipes
for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "Ägare kan ändra sina recept" on public.recipes;
create policy "Ägare kan ändra sina recept"
on public.recipes
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Ägare kan ta bort sina recept" on public.recipes;
create policy "Ägare kan ta bort sina recept"
on public.recipes
for delete
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "Användare kan läsa sina sparade recept" on public.favorite_recipes;
create policy "Användare kan läsa sina sparade recept"
on public.favorite_recipes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Användare kan spara recept" on public.favorite_recipes;
create policy "Användare kan spara recept"
on public.favorite_recipes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Användare kan ta bort sina sparade recept" on public.favorite_recipes;
create policy "Användare kan ta bort sina sparade recept"
on public.favorite_recipes
for delete
to authenticated
using (auth.uid() = user_id);
