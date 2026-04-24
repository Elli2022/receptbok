import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase, hasDatabaseUrl } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";
import { RecipeModel } from "@/lib/server/models";
import { recipePayload } from "@/lib/server/recipeData";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!hasDatabaseUrl()) {
    return req.method === "GET"
      ? res.status(200).json([])
      : res.status(503).json({
          message:
            "Databasen är inte kopplad ännu. Lägg till DATABASE_URL i Netlify.",
        });
  }

  await connectToDatabase();

  if (req.method === "GET") {
    const recipes = await RecipeModel.find({})
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return res.status(200).json(recipes);
  }

  if (req.method === "POST") {
    const user = await getCurrentUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Du behöver logga in för att lägga till recept.",
      });
    }

    const payload = recipePayload(req.body);

    if (!payload.name || payload.ingredients.length === 0) {
      return res.status(400).json({
        message: "Namn och minst en ingrediens krävs.",
      });
    }

    const recipe = await RecipeModel.create({
      ...payload,
      ownerId: user._id,
      ownerName: user.name || user.username,
      createdAt: new Date(),
    });

    return res.status(201).json(recipe);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Metoden är inte tillåten." });
}
