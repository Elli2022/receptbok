import type { NextApiRequest, NextApiResponse } from "next";
import {
  createSupabaseServerClient,
  getRequestUser,
  hasSupabaseConfig,
  publicUser,
  type ProfileRow,
} from "@/lib/server/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  }

  if (!hasSupabaseConfig()) {
    return res.status(200).json({ user: null });
  }

  const supabase = createSupabaseServerClient(req);
  const user = await getRequestUser(req);

  if (!user) {
    return res.status(200).json({ user: null });
  }

  const [{ data: profile }, { data: favorites }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,name,username")
      .eq("id", user.id)
      .maybeSingle<ProfileRow>(),
    supabase
      .from("favorite_recipes")
      .select("recipe_id")
      .eq("user_id", user.id),
  ]);

  const favoriteIds = (favorites || []).map((favorite) =>
    String(favorite.recipe_id)
  );

  return res.status(200).json({ user: publicUser(user, profile, favoriteIds) });
}
