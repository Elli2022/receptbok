import type { NextApiRequest, NextApiResponse } from "next";
import { recipePayload } from "@/lib/server/recipeData";
import {
  createSupabaseServerClient,
  getRequestUser,
  hasSupabaseConfig,
  profileName,
  recipeColumns,
  recipeFromRow,
  supabaseErrorMessage,
  type ProfileRow,
  type RecipeRow,
} from "@/lib/server/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!hasSupabaseConfig()) {
    return req.method === "GET"
      ? res.status(200).json([])
      : res.status(503).json({
          message:
            "Supabase är inte kopplat ännu. Lägg till Supabase-nycklarna i Netlify.",
        });
  }

  const supabase = createSupabaseServerClient(req);

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("recipes")
      .select(recipeColumns)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(503).json({
        message: supabaseErrorMessage(error),
      });
    }

    return res.status(200).json(((data || []) as RecipeRow[]).map(recipeFromRow));
  }

  if (req.method === "POST") {
    const user = await getRequestUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Du behöver logga in för att lägga till recept.",
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id,name,username")
      .eq("id", user.id)
      .maybeSingle<ProfileRow>();

    const payload = recipePayload(req.body);

    if (!payload.name || payload.ingredients.length === 0) {
      return res.status(400).json({
        message: "Namn och minst en ingrediens krävs.",
      });
    }

    const { data, error } = await supabase
      .from("recipes")
      .insert({
        name: payload.name,
        description: payload.description,
        portions: String(payload.portions || ""),
        category: payload.category,
        ingredients: payload.ingredients,
        instructions: payload.instructions,
        image: payload.image,
        source_image: payload.source_image,
        owner_id: user.id,
        owner_name: profileName(user, profile),
      })
      .select(recipeColumns)
      .single();

    if (error) {
      return res.status(400).json({
        message: supabaseErrorMessage(error),
      });
    }

    return res.status(201).json(recipeFromRow(data as RecipeRow));
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Metoden är inte tillåten." });
}
