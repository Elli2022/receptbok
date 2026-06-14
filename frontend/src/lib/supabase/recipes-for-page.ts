import { enrichRecipe, normalizeRecipe, type Recipe } from "@/lib/recipes";
import { listRecipesForServer } from "@/lib/supabase/list-recipes-server";

/** Server-only recipe list prepared for browse/detail client hydration. */
export async function getRecipesForBrowsePage(): Promise<Recipe[]> {
  const recipes = await listRecipesForServer();
  return recipes.map(normalizeRecipe).map(enrichRecipe);
}
