import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { connectToDatabase, hasDatabaseUrl } from "@/lib/server/db";
import { getCurrentUser, publicUser } from "@/lib/server/auth";
import { RecipeModel } from "@/lib/server/models";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!hasDatabaseUrl()) {
    return res.status(503).json({
      message: "Databasen är inte kopplad ännu. Lägg till DATABASE_URL i Netlify.",
    });
  }

  await connectToDatabase();
  const user = await getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ message: "Du behöver logga in först." });
  }

  if (req.method === "GET") {
    const recipes = await RecipeModel.find({
      _id: { $in: user.favorites || [] },
    })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return res.status(200).json({
      user: publicUser(user),
      recipes,
    });
  }

  if (req.method === "POST") {
    const recipeId = String(req.body?.recipeId || "");
    const action = req.body?.action === "remove" ? "remove" : "add";

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Ogiltigt recept." });
    }

    const recipe = await RecipeModel.findById(recipeId).select("_id");
    if (!recipe) {
      return res.status(404).json({ message: "Receptet kunde inte hittas." });
    }

    if (action === "remove") {
      user.favorites = (user.favorites || []).filter(
        (id: any) => String(id) !== recipeId
      );
    } else if (!(user.favorites || []).some((id: any) => String(id) === recipeId)) {
      user.favorites = [recipe._id, ...(user.favorites || [])];
    }

    await user.save();

    return res.status(200).json({
      user: publicUser(user),
      favoriteIds: (user.favorites || []).map(String),
    });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Metoden är inte tillåten." });
}
