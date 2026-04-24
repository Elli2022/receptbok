import type { NextApiRequest, NextApiResponse } from "next";
import {
  createSupabaseServerClient,
  getRequestUser,
  hasSupabaseConfig,
  publicUser,
  recipeColumns,
  recipeFromRow,
  supabaseErrorMessage,
  type ProfileRow,
  type RecipeRow,
} from "@/lib/server/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!hasSupabaseConfig()) {
    return res.status(503).json({
      message: "Supabase är inte kopplat ännu. Lägg till Supabase-nycklarna i Netlify.",
    });
  }

  const supabase = createSupabaseServerClient(req);
  const user = await getRequestUser(req);

  if (!user) {
    return res.status(401).json({ message: "Du behöver logga in först." });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,name,username")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (req.method === "GET") {
    const { data: favorites, error: favoriteError } = await supabase
      .from("favorite_recipes")
      .select("recipe_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (favoriteError) {
      return res.status(503).json({
        message: supabaseErrorMessage(favoriteError),
      });
    }

    const favoriteIds = (favorites || []).map((favorite) =>
      String(favorite.recipe_id)
    );

    const { data: recipes, error: recipesError } = favoriteIds.length
      ? await supabase.from("recipes").select(recipeColumns).in("id", favoriteIds)
      : { data: [], error: null };

    if (recipesError) {
      return res.status(503).json({ message: recipesError.message });
    }

    const recipeOrder = new Map(
      favoriteIds.map((recipeId, index) => [recipeId, index])
    );

    const orderedRecipes = ((recipes || []) as RecipeRow[]).sort(
      (first, second) =>
        (recipeOrder.get(first.id) ?? 0) - (recipeOrder.get(second.id) ?? 0)
    );

    return res.status(200).json({
      user: publicUser(user, profile, favoriteIds),
      recipes: orderedRecipes.map(recipeFromRow),
    });
  }

  if (req.method === "POST") {
    const recipeId = String(req.body?.recipeId || "");
    const action = req.body?.action === "remove" ? "remove" : "add";

    if (!recipeId) {
      return res.status(400).json({ message: "Ogiltigt recept." });
    }

    const { data: recipe } = await supabase
      .from("recipes")
      .select("id")
      .eq("id", recipeId)
      .maybeSingle();

    if (!recipe) {
      return res.status(404).json({ message: "Receptet kunde inte hittas." });
    }

    if (action === "remove") {
      const { error } = await supabase
        .from("favorite_recipes")
        .delete()
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId);

      if (error) {
        return res.status(400).json({ message: error.message });
      }
    } else {
      const { error } = await supabase.from("favorite_recipes").upsert(
        {
          user_id: user.id,
          recipe_id: recipeId,
        },
        { onConflict: "user_id,recipe_id" }
      );

      if (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    const { data: favorites } = await supabase
      .from("favorite_recipes")
      .select("recipe_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const favoriteIds = (favorites || []).map((favorite) =>
      String(favorite.recipe_id)
    );

    return res.status(200).json({
      user: publicUser(user, profile, favoriteIds),
      favoriteIds,
    });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Metoden är inte tillåten." });
}
