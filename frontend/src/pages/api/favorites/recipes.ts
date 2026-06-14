import type { NextApiRequest, NextApiResponse } from "next";
import * as Sentry from "@sentry/nextjs";
import { createSupabasePagesApiClient } from "@/lib/supabase/pages-api-client";
import { recipeRowToListClient, type RecipeRow } from "@/lib/supabase/recipes-map";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createSupabasePagesApiClient(req, res);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({ message: "Du behöver vara inloggad." });
    }

    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ message: "Metoden är inte tillåten." });
    }

    const { data, error } = await supabase.rpc("list_saved_recipes");

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const rows = (Array.isArray(data) ? data : []).filter(Boolean) as RecipeRow[];
    const recipes = rows.map((row) => recipeRowToListClient(row));

    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).json({ recipes });
  } catch (error) {
    Sentry.captureException(error);
    return res.status(500).json({
      message: "Kunde inte hämta sparade recept.",
      error: error instanceof Error ? error.message : "Okänt fel",
    });
  }
}
