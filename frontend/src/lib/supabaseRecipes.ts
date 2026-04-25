import { Recipe, normalizeRecipe } from "./recipes";
import { getSupabaseBrowserClient } from "./supabaseClient";

const recipeColumns =
  "id,name,description,portions,category,ingredients,instructions,image,source_image,owner_id,owner_name,created_at";

const tableSetupMessage =
  "Supabase-tabellerna är inte skapade ännu. Kör filen supabase/schema.sql i Supabase SQL Editor.";

const supabaseMessage = (error: { code?: string; message?: string }) =>
  error.code === "42P01" ||
  /could not find the table|schema cache/i.test(error.message || "")
    ? tableSetupMessage
    : error.message || "Supabase kunde inte svara just nu.";

const fromTable = (
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  tableName: string
) => supabase.from(tableName as never) as any;

const recipeFromRow = (row: any): Recipe =>
  normalizeRecipe({
    _id: row.id,
    name: row.name,
    description: row.description,
    portions: row.portions,
    category: row.category,
    ingredients: row.ingredients,
    instructions: row.instructions,
    image: row.image,
    source_image: row.source_image,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    createdAt: row.created_at,
  });

const requireSession = async () => {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();

  if (!data.session?.user) {
    throw new Error("Du behöver logga in först.");
  }

  return { supabase, session: data.session };
};

const ownerName = async (supabase: ReturnType<typeof getSupabaseBrowserClient>, user: any) => {
  const { data } = await fromTable(supabase, "profiles")
    .select("name,username")
    .eq("id", user.id)
    .maybeSingle();

  return (
    (data as { name?: string | null } | null)?.name ||
    String(user.user_metadata?.name || user.email || "Receptvän")
  );
};

export const listRecipes = async () => {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await fromTable(supabase, "recipes")
    .select(recipeColumns)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(supabaseMessage(error));
  }

  return (data || []).map(recipeFromRow);
};

export const getRecipeById = async (recipeId: string) => {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await fromTable(supabase, "recipes")
    .select(recipeColumns)
    .eq("id", recipeId)
    .maybeSingle();

  if (error) {
    throw new Error(supabaseMessage(error));
  }

  return data ? recipeFromRow(data) : null;
};

export const createRecipe = async (recipe: Recipe) => {
  const { supabase, session } = await requireSession();
  const name = await ownerName(supabase, session.user);

  const { data, error } = await fromTable(supabase, "recipes")
    .insert({
      name: recipe.name,
      description: recipe.description || "",
      portions: String(recipe.portions || ""),
      category: recipe.category || "Okategoriserat",
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      image: recipe.image || "",
      source_image: recipe.source_image || "",
      owner_id: session.user.id,
      owner_name: name,
    })
    .select(recipeColumns)
    .single();

  if (error) {
    throw new Error(supabaseMessage(error));
  }

  return recipeFromRow(data);
};

export const getFavoriteIds = async () => {
  const { supabase, session } = await requireSession();
  const { data, error } = await fromTable(supabase, "favorite_recipes")
    .select("recipe_id")
    .eq("user_id", session.user.id);

  if (error) {
    throw new Error(supabaseMessage(error));
  }

  return ((data || []) as Array<{ recipe_id: string }>).map((favorite) =>
    String(favorite.recipe_id)
  );
};

export const setRecipeFavorite = async (recipeId: string, isSaved: boolean) => {
  const { supabase, session } = await requireSession();

  if (isSaved) {
    const { error } = await fromTable(supabase, "favorite_recipes")
      .delete()
      .eq("user_id", session.user.id)
      .eq("recipe_id", recipeId);

    if (error) {
      throw new Error(supabaseMessage(error));
    }
  } else {
    const { error } = await fromTable(supabase, "favorite_recipes").upsert(
      {
        user_id: session.user.id,
        recipe_id: recipeId,
      },
      { onConflict: "user_id,recipe_id" }
    );

    if (error) {
      throw new Error(supabaseMessage(error));
    }
  }

  return getFavoriteIds();
};

export const listSavedRecipes = async () => {
  const { supabase, session } = await requireSession();
  const { data: favorites, error: favoriteError } = await fromTable(
    supabase,
    "favorite_recipes"
  )
    .select("recipe_id,created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (favoriteError) {
    throw new Error(supabaseMessage(favoriteError));
  }

  const favoriteIds = ((favorites || []) as Array<{ recipe_id: string }>).map(
    (favorite) => String(favorite.recipe_id)
  );

  if (favoriteIds.length === 0) {
    return [];
  }

  const { data, error } = await fromTable(supabase, "recipes")
    .select(recipeColumns)
    .in("id", favoriteIds);

  if (error) {
    throw new Error(supabaseMessage(error));
  }

  const recipeOrder = new Map(
    favoriteIds.map((recipeId, index) => [recipeId, index])
  );

  return ((data || []) as any[])
    .map(recipeFromRow)
    .sort(
      (first: Recipe, second: Recipe) =>
        (recipeOrder.get(first._id) ?? 0) - (recipeOrder.get(second._id) ?? 0)
    );
};
