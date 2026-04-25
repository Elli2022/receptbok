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

create or replace function public.set_recipe_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_name text;
begin
  if auth.uid() is null then
    raise exception 'Du behöver vara inloggad för att skapa recept.';
  end if;

  if new.owner_id is null then
    new.owner_id = auth.uid();
  end if;

  if new.owner_id <> auth.uid() then
    raise exception 'Du kan bara skapa recept för ditt eget konto.';
  end if;

  if coalesce(new.owner_name, '') = '' then
    select name into profile_name
    from public.profiles
    where id = auth.uid();

    new.owner_name = coalesce(profile_name, 'Receptvän');
  end if;

  return new;
end;
$$;

drop trigger if exists recipes_set_owner on public.recipes;
create trigger recipes_set_owner
before insert on public.recipes
for each row
execute function public.set_recipe_owner();

drop function if exists public.create_recipe(text, text, text, text, text[], text[], text, text);
create or replace function public.create_recipe(
  recipe_name text,
  recipe_description text,
  recipe_portions text,
  recipe_category text,
  recipe_ingredients text[],
  recipe_instructions text[],
  recipe_image text,
  recipe_source_image text
)
returns table (
  id uuid,
  owner_id uuid,
  owner_name text,
  name text,
  description text,
  portions text,
  category text,
  ingredients text[],
  instructions text[],
  image text,
  source_image text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  current_owner_name text;
begin
  current_user_id = auth.uid();

  if current_user_id is null then
    raise exception 'Du behöver vara inloggad för att skapa recept.';
  end if;

  select profiles.name into current_owner_name
  from public.profiles
  where profiles.id = current_user_id;

  return query
  insert into public.recipes (
    owner_id,
    owner_name,
    name,
    description,
    portions,
    category,
    ingredients,
    instructions,
    image,
    source_image
  )
  values (
    current_user_id,
    coalesce(current_owner_name, 'Receptvän'),
    recipe_name,
    coalesce(recipe_description, ''),
    coalesce(recipe_portions, ''),
    coalesce(nullif(recipe_category, ''), 'Okategoriserat'),
    coalesce(recipe_ingredients, '{}'::text[]),
    coalesce(recipe_instructions, '{}'::text[]),
    coalesce(recipe_image, ''),
    coalesce(recipe_source_image, '')
  )
  returning
    recipes.id,
    recipes.owner_id,
    recipes.owner_name,
    recipes.name,
    recipes.description,
    recipes.portions,
    recipes.category,
    recipes.ingredients,
    recipes.instructions,
    recipes.image,
    recipes.source_image,
    recipes.created_at,
    recipes.updated_at;
end;
$$;

revoke all on function public.create_recipe(text, text, text, text, text[], text[], text, text) from public;
grant execute on function public.create_recipe(text, text, text, text, text[], text[], text, text) to authenticated;

drop function if exists public.save_favorite_recipe(uuid);
create or replace function public.save_favorite_recipe(target_recipe_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Du behöver vara inloggad för att spara recept.';
  end if;

  insert into public.favorite_recipes (user_id, recipe_id)
  values (auth.uid(), target_recipe_id)
  on conflict (user_id, recipe_id) do nothing;
end;
$$;

revoke all on function public.save_favorite_recipe(uuid) from public;
grant execute on function public.save_favorite_recipe(uuid) to authenticated;

drop function if exists public.remove_favorite_recipe(uuid);
create or replace function public.remove_favorite_recipe(target_recipe_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Du behöver vara inloggad för att ta bort sparade recept.';
  end if;

  delete from public.favorite_recipes
  where favorite_recipes.user_id = auth.uid()
    and favorite_recipes.recipe_id = target_recipe_id;
end;
$$;

revoke all on function public.remove_favorite_recipe(uuid) from public;
grant execute on function public.remove_favorite_recipe(uuid) to authenticated;

drop function if exists public.list_public_recipes();
create or replace function public.list_public_recipes()
returns table (
  id uuid,
  owner_id uuid,
  owner_name text,
  name text,
  description text,
  portions text,
  category text,
  ingredients text[],
  instructions text[],
  image text,
  source_image text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    recipes.id,
    recipes.owner_id,
    recipes.owner_name,
    recipes.name,
    recipes.description,
    recipes.portions,
    recipes.category,
    recipes.ingredients,
    recipes.instructions,
    recipes.image,
    recipes.source_image,
    recipes.created_at
  from public.recipes
  order by recipes.created_at desc;
$$;

revoke all on function public.list_public_recipes() from public;
grant execute on function public.list_public_recipes() to anon, authenticated;

drop function if exists public.get_public_recipe(uuid);
create or replace function public.get_public_recipe(target_recipe_id uuid)
returns table (
  id uuid,
  owner_id uuid,
  owner_name text,
  name text,
  description text,
  portions text,
  category text,
  ingredients text[],
  instructions text[],
  image text,
  source_image text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    recipes.id,
    recipes.owner_id,
    recipes.owner_name,
    recipes.name,
    recipes.description,
    recipes.portions,
    recipes.category,
    recipes.ingredients,
    recipes.instructions,
    recipes.image,
    recipes.source_image,
    recipes.created_at
  from public.recipes
  where recipes.id = target_recipe_id
  limit 1;
$$;

revoke all on function public.get_public_recipe(uuid) from public;
grant execute on function public.get_public_recipe(uuid) to anon, authenticated;

drop function if exists public.list_user_favorite_ids();
create or replace function public.list_user_favorite_ids()
returns table (recipe_id uuid)
language sql
security definer
set search_path = public
as $$
  select favorite_recipes.recipe_id
  from public.favorite_recipes
  where favorite_recipes.user_id = auth.uid()
  order by favorite_recipes.created_at desc;
$$;

revoke all on function public.list_user_favorite_ids() from public;
grant execute on function public.list_user_favorite_ids() to authenticated;

drop function if exists public.list_saved_recipes();
create or replace function public.list_saved_recipes()
returns table (
  id uuid,
  owner_id uuid,
  owner_name text,
  name text,
  description text,
  portions text,
  category text,
  ingredients text[],
  instructions text[],
  image text,
  source_image text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    recipes.id,
    recipes.owner_id,
    recipes.owner_name,
    recipes.name,
    recipes.description,
    recipes.portions,
    recipes.category,
    recipes.ingredients,
    recipes.instructions,
    recipes.image,
    recipes.source_image,
    recipes.created_at
  from public.favorite_recipes
  join public.recipes on recipes.id = favorite_recipes.recipe_id
  where favorite_recipes.user_id = auth.uid()
  order by favorite_recipes.created_at desc;
$$;

revoke all on function public.list_saved_recipes() from public;
grant execute on function public.list_saved_recipes() to authenticated;

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
with check (auth.uid() is not null and auth.uid() = owner_id);

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
