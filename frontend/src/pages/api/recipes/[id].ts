import type { NextApiRequest, NextApiResponse } from "next";
import * as Sentry from "@sentry/nextjs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveRecipeImageForServer } from "@/lib/supabase/embedded-recipe-images";
import { createSupabasePagesApiClient } from "@/lib/supabase/pages-api-client";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { parseRecipeId, rejectOversizedBody } from "@/lib/api/request-guards";
import { validateRecipePayload } from "@/lib/api/validate-recipe-payload";
import {
  normalizeRecipePayload,
  recipeRowToClient,
  type RecipeRow,
} from "@/lib/supabase/recipes-map";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getSupabaseAdmin();
  const recipeId = parseRecipeId(req.query.id);
  if (!recipeId) {
    return res.status(400).json({ message: "Ogiltigt recept-id." });
  }
  const id = recipeId;

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
      res.setHeader("Netlify-Vary", "query=fields");

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
          image: resolveRecipeImageForServer(id, row.image),
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
            image: resolveRecipeImageForServer(id, null) || null,
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

      const row = rows[0];
      return res.status(200).json(
        recipeRowToClient({
          ...row,
          image: resolveRecipeImageForServer(id, row.image),
        })
      );
    }

    if (req.method === "PUT") {
      if (rejectOversizedBody(req, res, 512_000)) {
        return;
      }
      if (
        !enforceRateLimit(req, res, {
          scope: "recipes-write",
          limit: 30,
          windowMs: 60_000,
        })
      ) {
        return;
      }

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

      const validationError = validateRecipePayload(payload);
      if (validationError) {
        return res.status(400).json({ message: validationError });
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
      if (
        !enforceRateLimit(req, res, {
          scope: "recipes-delete",
          limit: 20,
          windowMs: 60_000,
        })
      ) {
        return;
      }

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
    Sentry.captureException(e);
    return res.status(500).json({
      message: "Kunde inte hantera receptet.",
      error: e instanceof Error ? e.message : "Okänt fel",
    });
  }
}
