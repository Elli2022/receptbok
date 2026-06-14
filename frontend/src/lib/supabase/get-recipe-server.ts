import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveRecipeImageForServer } from "@/lib/supabase/embedded-recipe-images";
import { recipeRowToClient, type RecipeRow } from "@/lib/supabase/recipes-map";

export async function getRecipeMetadataForServer(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_public_recipe", {
    target_recipe_id: id,
  });

  if (error) {
    console.error("getRecipeMetadataForServer:", error);
    return null;
  }

  const rows = (Array.isArray(data) ? data : [data]).filter(Boolean) as RecipeRow[];
  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const client = recipeRowToClient({
    ...row,
    image: resolveRecipeImageForServer(id, row.image),
  });

  return {
    name: client.name,
    description: client.description || undefined,
    image: client.image || undefined,
  };
}
