import type { NextApiRequest, NextApiResponse } from "next";
import { recipePayload } from "@/lib/server/recipeData";
import {
  createSupabaseServerClient,
  getRequestUser,
  hasSupabaseConfig,
  recipeColumns,
  recipeFromRow,
  supabaseErrorMessage,
  type RecipeRow,
} from "@/lib/server/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!hasSupabaseConfig()) {
    return res.status(404).json({
      message: "Supabase är inte kopplat ännu.",
    });
  }

  if (typeof id !== "string") {
    return res.status(404).json({ message: "Receptet kunde inte hittas." });
  }

  const supabase = createSupabaseServerClient(req);

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("recipes")
      .select(recipeColumns)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return res.status(503).json({
        message: supabaseErrorMessage(error),
      });
    }

    if (!data) {
      return res.status(404).json({ message: "Receptet kunde inte hittas." });
    }

    return res.status(200).json(recipeFromRow(data as RecipeRow));
  }

  if (req.method === "PUT") {
    const user = await getRequestUser(req);
    if (!user) {
      return res.status(403).json({ message: "Du kan bara ändra dina egna recept." });
    }

    const payload = recipePayload(req.body);
    if (!payload.name || payload.ingredients.length === 0) {
      return res.status(400).json({ message: "Namn och minst en ingrediens krävs." });
    }

    const { data, error } = await supabase
      .from("recipes")
      .update({
        name: payload.name,
        description: payload.description,
        portions: String(payload.portions || ""),
        category: payload.category,
        ingredients: payload.ingredients,
        instructions: payload.instructions,
        image: payload.image,
        source_image: payload.source_image,
      })
      .eq("id", id)
      .select(recipeColumns)
      .maybeSingle();

    if (error) {
      return res.status(403).json({ message: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: "Receptet kunde inte hittas." });
    }

    return res.status(200).json(recipeFromRow(data as RecipeRow));
  }

  if (req.method === "DELETE") {
    const user = await getRequestUser(req);
    if (!user) {
      return res.status(403).json({ message: "Du kan bara ta bort dina egna recept." });
    }

    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (error) {
      return res.status(403).json({ message: error.message });
    }

    return res.status(200).json({ message: "Receptet har tagits bort." });
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ message: "Metoden är inte tillåten." });
}
