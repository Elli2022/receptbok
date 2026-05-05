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
