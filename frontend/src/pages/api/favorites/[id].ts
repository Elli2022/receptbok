import type { NextApiRequest, NextApiResponse } from "next";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { parseRecipeId } from "@/lib/api/request-guards";
import { createSupabasePagesApiClient } from "@/lib/supabase/pages-api-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabasePagesApiClient(req, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ message: "Du behöver vara inloggad." });
  }

  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  }

  if (
    !enforceRateLimit(req, res, {
      scope: "favorites-write",
      limit: 60,
      windowMs: 60_000,
    })
  ) {
    return;
  }

  const recipeId = parseRecipeId(req.query.id);
  if (!recipeId) {
    return res.status(400).json({ message: "Ogiltigt recipeId." });
  }

  const { error } = await supabase.rpc("remove_favorite_recipe", {
    target_recipe_id: recipeId,
  });
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(200).json({ ok: true });
}
