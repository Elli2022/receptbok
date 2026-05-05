import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabasePagesApiClient } from "@/lib/supabase/pages-api-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabasePagesApiClient(req, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ message: "Du behöver vara inloggad." });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase.rpc("list_user_favorite_ids");
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const ids = Array.isArray(data)
      ? data.map((row: { recipe_id: string }) => row.recipe_id)
      : [];
    return res.status(200).json({ recipeIds: ids });
  }

  if (req.method === "POST") {
    const recipeId = String(req.body?.recipeId ?? "").trim();
    if (!recipeId) {
      return res.status(400).json({ message: "recipeId saknas." });
    }

    const { error } = await supabase.rpc("save_favorite_recipe", {
      target_recipe_id: recipeId,
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Metoden är inte tillåten." });
}
