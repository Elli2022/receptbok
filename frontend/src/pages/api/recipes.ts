import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabasePagesApiClient } from "@/lib/supabase/pages-api-client";
import {
  normalizeRecipePayload,
  recipeRowToClient,
  type RecipeRow,
} from "@/lib/supabase/recipes-map";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    if (req.method === "GET") {
      return res.status(200).json([]);
    }
    return res.status(503).json({
      message:
        "Supabase är inte konfigurerad. Sätt NEXT_PUBLIC_SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  try {
    if (req.method === "GET") {
      // Lightweight list payload for fast page loads.
      // Large base64 images are intentionally excluded from list responses.
      const { data, error } = await supabase
        .from("recipes")
        .select(
          "id,name,description,portions,category,ingredients,instructions,created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      const rows = ((data ?? []) as Partial<RecipeRow>[]).map((row) => ({
        ...row,
        image: "",
        source_image: "",
      })) as RecipeRow[];

      return res.status(200).json(rows.map(recipeRowToClient));
    }

    if (req.method === "POST") {
      const userClient = createSupabasePagesApiClient(req, res);
      const {
        data: { user },
      } = await userClient.auth.getUser();

      if (!user) {
        return res.status(401).json({ message: "Du behöver vara inloggad." });
      }

      const payload = normalizeRecipePayload(
        (req.body ?? {}) as Record<string, unknown>
      );

      if (!payload.name || payload.ingredients.length === 0) {
        return res.status(400).json({
          message: "Namn och minst en ingrediens krävs.",
        });
      }

      const { data, error } = await userClient.rpc("create_recipe", {
        recipe_name: payload.name,
        recipe_description: payload.description,
        recipe_portions: payload.portions,
        recipe_category: payload.category,
        recipe_ingredients: payload.ingredients,
        recipe_instructions: payload.instructions,
        recipe_image: payload.image,
        recipe_source_image: payload.source_image,
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      const rows = (Array.isArray(data) ? data : [data]).filter(Boolean) as RecipeRow[];
      if (rows.length === 0) {
        return res.status(500).json({ message: "Kunde inte skapa receptet." });
      }

      return res.status(201).json(recipeRowToClient(rows[0]));
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  } catch (e) {
    return res.status(500).json({
      message: "Kunde inte hantera receptförfrågan.",
      error: e instanceof Error ? e.message : "Okänt fel",
    });
  }
}
