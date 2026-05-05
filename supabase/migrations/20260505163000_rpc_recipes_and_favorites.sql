-- Receptbok v2: RPC-baserad modell för recept + favoriter
-- Idempotent migration som bygger vidare på initial schema.

-- Recipes: lägg till ägarfält, updated_at och text-portions för flexibilitet ("4-6", "ca 2")
alter table public.recipes
  add column if not exists owner_id uuid references auth.users (id) on delete set null,
  add column if not exists owner_name text not null default 'Receptvän',
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'recipes'
      and column_name = 'portions'
      and data_type <> 'text'
  ) then
    alter table public.recipes
      alter column portions type text using coalesce(portions::text, '');
  end if;
end
$$;

-- favorites-tabell (many-to-many)
create table if not exists public.favorite_recipes (
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create index if not exists favorite_recipes_user_created_idx
  on public.favorite_recipes (user_id, created_at desc);

create index if not exists favorite_recipes_recipe_idx
  on public.favorite_recipes (recipe_id);

alter table public.favorite_recipes enable row level security;

drop policy if exists "favorite_recipes_select_own" on public.favorite_recipes;
create policy "favorite_recipes_select_own"
  on public.favorite_recipes
  for select
  using (auth.uid() = user_id);

drop policy if exists "favorite_recipes_insert_own" on public.favorite_recipes;
create policy "favorite_recipes_insert_own"
  on public.favorite_recipes
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "favorite_recipes_delete_own" on public.favorite_recipes;
create policy "favorite_recipes_delete_own"
  on public.favorite_recipes
  for delete
  using (auth.uid() = user_id);

drop policy if exists "favorite_recipes_service_role_all" on public.favorite_recipes;
create policy "favorite_recipes_service_role_all"
  on public.favorite_recipes
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_recipes_updated_at on public.recipes;
create trigger set_recipes_updated_at
before update on public.recipes
for each row
execute function public.set_updated_at();

-- create_recipe (inloggning krävs, ägare sätts automatiskt)
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
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Du behöver vara inloggad för att skapa recept.';
  end if;

  select p.name
    into current_owner_name
  from public.profiles p
  where p.id = current_user_id;

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
    coalesce(nullif(current_owner_name, ''), 'Receptvän'),
    nullif(trim(coalesce(recipe_name, '')), ''),
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

-- Spara favorit
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

  if target_recipe_id is null then
    raise exception 'Recept-id saknas.';
  end if;

  if not exists (select 1 from public.recipes r where r.id = target_recipe_id) then
    raise exception 'Receptet finns inte.';
  end if;

  insert into public.favorite_recipes (user_id, recipe_id)
  values (auth.uid(), target_recipe_id)
  on conflict (user_id, recipe_id) do nothing;
end;
$$;

-- Ta bort favorit
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

  delete from public.favorite_recipes f
  where f.user_id = auth.uid()
    and f.recipe_id = target_recipe_id;
end;
$$;

-- Publik receptlista
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
    r.id,
    r.owner_id,
    r.owner_name,
    r.name,
    r.description,
    r.portions,
    r.category,
    r.ingredients,
    r.instructions,
    r.image,
    r.source_image,
    r.created_at
  from public.recipes r
  order by r.created_at desc;
$$;

-- Hämta en publik receptpost
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
    r.id,
    r.owner_id,
    r.owner_name,
    r.name,
    r.description,
    r.portions,
    r.category,
    r.ingredients,
    r.instructions,
    r.image,
    r.source_image,
    r.created_at
  from public.recipes r
  where r.id = target_recipe_id
  limit 1;
$$;

-- Lista favorit-id för inloggad användare
create or replace function public.list_user_favorite_ids()
returns table (recipe_id uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Du behöver vara inloggad för att lista sparade recept.';
  end if;

  return query
  select f.recipe_id
  from public.favorite_recipes f
  where f.user_id = auth.uid()
  order by f.created_at desc;
end;
$$;

-- Lista sparade recept för inloggad användare
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
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Du behöver vara inloggad för att lista sparade recept.';
  end if;

  return query
  select
    r.id,
    r.owner_id,
    r.owner_name,
    r.name,
    r.description,
    r.portions,
    r.category,
    r.ingredients,
    r.instructions,
    r.image,
    r.source_image,
    r.created_at
  from public.favorite_recipes f
  join public.recipes r on r.id = f.recipe_id
  where f.user_id = auth.uid()
  order by f.created_at desc;
end;
$$;

-- Rättigheter
revoke all on function public.create_recipe(text, text, text, text, text[], text[], text, text) from public;
grant execute on function public.create_recipe(text, text, text, text, text[], text[], text, text) to authenticated;

revoke all on function public.save_favorite_recipe(uuid) from public;
grant execute on function public.save_favorite_recipe(uuid) to authenticated;

revoke all on function public.remove_favorite_recipe(uuid) from public;
grant execute on function public.remove_favorite_recipe(uuid) to authenticated;

revoke all on function public.list_public_recipes() from public;
grant execute on function public.list_public_recipes() to anon, authenticated;

revoke all on function public.get_public_recipe(uuid) from public;
grant execute on function public.get_public_recipe(uuid) to anon, authenticated;

revoke all on function public.list_user_favorite_ids() from public;
grant execute on function public.list_user_favorite_ids() to authenticated;

revoke all on function public.list_saved_recipes() from public;
grant execute on function public.list_saved_recipes() to authenticated;

grant select, insert, delete on table public.favorite_recipes to authenticated;
grant all on table public.favorite_recipes to service_role;
