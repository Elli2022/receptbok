-- Recipe filter metadata: meal_type, tags, prep_time_minutes
alter table public.recipes
  add column if not exists meal_type text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists prep_time_minutes integer;

-- Extend create_recipe with optional metadata
drop function if exists public.create_recipe(text, text, text, text, text[], text[], text, text);
create or replace function public.create_recipe(
  recipe_name text,
  recipe_description text,
  recipe_portions text,
  recipe_category text,
  recipe_ingredients text[],
  recipe_instructions text[],
  recipe_image text,
  recipe_source_image text,
  recipe_meal_type text default null,
  recipe_tags text[] default '{}',
  recipe_prep_time_minutes integer default null
)
returns table (
  id uuid,
  owner_id uuid,
  owner_name text,
  name text,
  description text,
  portions text,
  category text,
  meal_type text,
  tags text[],
  prep_time_minutes integer,
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
    meal_type,
    tags,
    prep_time_minutes,
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
    nullif(trim(coalesce(recipe_meal_type, '')), ''),
    coalesce(recipe_tags, '{}'::text[]),
    recipe_prep_time_minutes,
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
    recipes.meal_type,
    recipes.tags,
    recipes.prep_time_minutes,
    recipes.ingredients,
    recipes.instructions,
    recipes.image,
    recipes.source_image,
    recipes.created_at,
    recipes.updated_at;
end;
$$;

revoke all on function public.create_recipe(text, text, text, text, text[], text[], text, text, text, text[], integer) from public;
grant execute on function public.create_recipe(text, text, text, text, text[], text[], text, text, text, text[], integer) to authenticated;

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
  meal_type text,
  tags text[],
  prep_time_minutes integer,
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
    r.meal_type,
    r.tags,
    r.prep_time_minutes,
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
  meal_type text,
  tags text[],
  prep_time_minutes integer,
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
    r.meal_type,
    r.tags,
    r.prep_time_minutes,
    r.ingredients,
    r.instructions,
    r.image,
    r.source_image,
    r.created_at
  from public.recipes r
  where r.id = target_recipe_id
  limit 1;
$$;

-- Snabb receptmetadata utan stora bildkolumner
create or replace function public.get_public_recipe_basic(target_recipe_id uuid)
returns table (
  id uuid,
  owner_id uuid,
  owner_name text,
  name text,
  description text,
  portions text,
  category text,
  meal_type text,
  tags text[],
  prep_time_minutes integer,
  ingredients text[],
  instructions text[],
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
    r.meal_type,
    r.tags,
    r.prep_time_minutes,
    r.ingredients,
    r.instructions,
    r.created_at
  from public.recipes r
  where r.id = target_recipe_id
  limit 1;
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
  meal_type text,
  tags text[],
  prep_time_minutes integer,
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
    r.meal_type,
    r.tags,
    r.prep_time_minutes,
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
