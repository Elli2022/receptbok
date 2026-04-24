import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { connectToDatabase, hasDatabaseUrl } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";
import { RecipeModel } from "@/lib/server/models";
import { recipePayload } from "@/lib/server/recipeData";

const isOwner = (recipe: any, user: any) =>
  recipe.ownerId && user && String(recipe.ownerId) === String(user._id);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!hasDatabaseUrl()) {
    return res.status(404).json({
      message: "Databasen är inte kopplad ännu.",
    });
  }

  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Receptet kunde inte hittas." });
  }

  await connectToDatabase();

  if (req.method === "GET") {
    const recipe = await RecipeModel.findById(id).lean();

    if (!recipe) {
      return res.status(404).json({ message: "Receptet kunde inte hittas." });
    }

    return res.status(200).json(recipe);
  }

  if (req.method === "PUT") {
    const user = await getCurrentUser(req);
    const existingRecipe = await RecipeModel.findById(id);

    if (!existingRecipe) {
      return res.status(404).json({ message: "Receptet kunde inte hittas." });
    }

    if (!isOwner(existingRecipe, user)) {
      return res.status(403).json({ message: "Du kan bara ändra dina egna recept." });
    }

    const payload = recipePayload(req.body);
    if (!payload.name || payload.ingredients.length === 0) {
      return res.status(400).json({ message: "Namn och minst en ingrediens krävs." });
    }

    Object.assign(existingRecipe, payload);
    await existingRecipe.save();
    return res.status(200).json(existingRecipe);
  }

  if (req.method === "DELETE") {
    const user = await getCurrentUser(req);
    const existingRecipe = await RecipeModel.findById(id);

    if (!existingRecipe) {
      return res.status(404).json({ message: "Receptet kunde inte hittas." });
    }

    if (!isOwner(existingRecipe, user)) {
      return res.status(403).json({ message: "Du kan bara ta bort dina egna recept." });
    }

    await existingRecipe.deleteOne();
    return res.status(200).json({ message: "Receptet har tagits bort." });
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ message: "Metoden är inte tillåten." });
}
