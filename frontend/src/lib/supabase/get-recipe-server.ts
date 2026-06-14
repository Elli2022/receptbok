import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveRecipeImageForServer } from "@/lib/supabase/embedded-recipe-images";

type RecipeBasicRow = {
  id: string;
  name: string;
  description: string | null;
};

export async function getRecipeMetadataForServer(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_public_recipe_basic", {
    target_recipe_id: id,
  });

  if (error) {
    console.error("getRecipeMetadataForServer:", error);
    return null;
  }

  const rows = (Array.isArray(data) ? data : [data]).filter(Boolean) as RecipeBasicRow[];
  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const image = resolveRecipeImageForServer(id, null);

  return {
    name: row.name,
    description: row.description || undefined,
    image: image || undefined,
  };
}
