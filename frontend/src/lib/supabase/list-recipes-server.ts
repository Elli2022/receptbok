import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveRecipeImageForServer } from "@/lib/supabase/embedded-recipe-images";
import { recipeRowToListClient, type RecipeRow } from "@/lib/supabase/recipes-map";

/** Server-only recipe list (SSR / API). Avoids self-fetch to /api on Netlify. */
export async function listRecipesForServer() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id,owner_name,name,description,portions,category,meal_type,tags,prep_time_minutes,ingredients,image,source_image,created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listRecipesForServer:", error);
    return [];
  }

  const rows = ((data ?? []) as Partial<RecipeRow>[]).map((row) => ({
    ...row,
    image: resolveRecipeImageForServer(row.id, row.image) || row.image || "",
    source_image: row.source_image ?? "",
  })) as RecipeRow[];

  return rows.map(recipeRowToListClient);
}
