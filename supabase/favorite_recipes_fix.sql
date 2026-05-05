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
