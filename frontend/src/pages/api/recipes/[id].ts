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
  const { id } = req.query;

  if (typeof id !== "string" || !id) {
    return res.status(400).json({ message: "Ogiltigt recept-id." });
  }

  if (!supabase) {
    return res.status(503).json({
      message: "Supabase är inte konfigurerad.",
    });
  }

  try {
    if (req.method === "GET") {
      const fields =
        typeof req.query.fields === "string" ? req.query.fields.trim() : "";

      res.setHeader(
        "Cache-Control",
        "public, s-maxage=120, stale-while-revalidate=300"
      );

      if (fields === "media") {
        const { data, error } = await supabase.rpc("get_public_recipe_media", {
          target_recipe_id: id,
        });

        if (error) {
          return res.status(500).json({ message: error.message });
        }

        const rows = (Array.isArray(data) ? data : [data]).filter(Boolean) as {
          image: string | null;
          source_image: string | null;
        }[];
        if (rows.length === 0) {
          return res.status(404).json({ message: "Receptet hittades inte." });
        }

        const row = rows[0];
        return res.status(200).json({
          image: row.image ?? "",
          source_image: row.source_image ?? "",
        });
      }

      if (fields === "basic") {
        const { data, error } = await supabase.rpc("get_public_recipe_basic", {
          target_recipe_id: id,
        });

        if (error) {
          return res.status(500).json({ message: error.message });
        }

        const rows = (Array.isArray(data) ? data : [data]).filter(Boolean) as Omit<
          RecipeRow,
          "image" | "source_image"
        >[];
        if (rows.length === 0) {
          return res.status(404).json({ message: "Receptet hittades inte." });
        }

        const row = rows[0];
        return res.status(200).json(
          recipeRowToClient({
            ...row,
            image: null,
            source_image: null,
          } as RecipeRow)
        );
      }

      const { data, error } = await supabase.rpc("get_public_recipe", {
        target_recipe_id: id,
      });

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      const rows = (Array.isArray(data) ? data : [data]).filter(Boolean) as RecipeRow[];
      if (rows.length === 0) {
        return res.status(404).json({ message: "Receptet hittades inte." });
      }

      return res.status(200).json(recipeRowToClient(rows[0]));
    }

    if (req.method === "PUT") {
      const userClient = createSupabasePagesApiClient(req, res);
      const {
        data: { user },
      } = await userClient.auth.getUser();
      if (!user) {
        return res.status(401).json({ message: "Du behöver vara inloggad." });
      }

      const { data: ownerRow, error: ownerError } = await supabase
        .from("recipes")
        .select("owner_id")
        .eq("id", id)
        .maybeSingle();
      if (ownerError) {
        return res.status(500).json({ message: ownerError.message });
      }
      if (!ownerRow) {
        return res.status(404).json({ message: "Receptet hittades inte." });
      }
      if (!ownerRow.owner_id || ownerRow.owner_id !== user.id) {
        return res.status(403).json({
          message: "Du kan bara redigera recept du själv har skapat.",
        });
      }

      const payload = normalizeRecipePayload(
        (req.body ?? {}) as Record<string, unknown>
      );

      if (!payload.name || payload.ingredients.length === 0) {
        return res.status(400).json({
          message: "Namn och minst en ingrediens krävs.",
        });
      }

      const update = {
        name: payload.name,
        description: payload.description || null,
        portions: payload.portions,
        category: payload.category,
        ingredients: payload.ingredients,
        instructions: payload.instructions,
        image: payload.image || null,
        source_image: payload.source_image || null,
      };

      const { data, error } = await supabase
        .from("recipes")
        .update(update)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      if (!data) {
        return res.status(404).json({ message: "Receptet hittades inte." });
      }

      return res.status(200).json(recipeRowToClient(data as RecipeRow));
    }

    if (req.method === "DELETE") {
      const userClient = createSupabasePagesApiClient(req, res);
      const {
        data: { user },
      } = await userClient.auth.getUser();
      if (!user) {
        return res.status(401).json({ message: "Du behöver vara inloggad." });
      }

      const { data: ownerRow, error: ownerError } = await supabase
        .from("recipes")
        .select("owner_id")
        .eq("id", id)
        .maybeSingle();
      if (ownerError) {
        return res.status(500).json({ message: ownerError.message });
      }
      if (!ownerRow) {
        return res.status(404).json({ message: "Receptet hittades inte." });
      }
      if (!ownerRow.owner_id || ownerRow.owner_id !== user.id) {
        return res.status(403).json({
          message: "Du kan bara ta bort recept du själv har skapat.",
        });
      }

      const { data, error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      if (!data) {
        return res.status(404).json({ message: "Receptet hittades inte." });
      }

      return res.status(200).json({ message: "Receptet har tagits bort." });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  } catch (e) {
    return res.status(500).json({
      message: "Kunde inte hantera receptet.",
      error: e instanceof Error ? e.message : "Okänt fel",
    });
  }
}
