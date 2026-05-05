-- Snabb receptmetadata utan stora bildkolumner (undviker TOAST-hämtning)
create or replace function public.get_public_recipe_basic(target_recipe_id uuid)
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
    r.created_at
  from public.recipes r
  where r.id = target_recipe_id
  limit 1;
$$;

-- Endast bildfält (separat roundtrip efter att sidan målat upp text)
create or replace function public.get_public_recipe_media(target_recipe_id uuid)
returns table (
  image text,
  source_image text
)
language sql
security definer
set search_path = public
as $$
  select
    r.image,
    r.source_image
  from public.recipes r
  where r.id = target_recipe_id
  limit 1;
$$;

revoke all on function public.get_public_recipe_basic(uuid) from public;
grant execute on function public.get_public_recipe_basic(uuid) to anon, authenticated;

revoke all on function public.get_public_recipe_media(uuid) from public;
grant execute on function public.get_public_recipe_media(uuid) to anon, authenticated;
