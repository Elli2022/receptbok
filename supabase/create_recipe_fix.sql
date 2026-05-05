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
