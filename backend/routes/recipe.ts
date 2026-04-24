// backend/routes/recipe.ts
import express, { Request, Response } from "express";
import Recipe from "../models/Recipe";

const router = express.Router();

const toStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeRecipeInput = (body: any) => ({
  name: String(body.name || "").trim(),
  description: body.description ? String(body.description).trim() : "",
  portions: Number(body.portions) || undefined,
  ingredients: toStringArray(body.ingredients),
  instructions: toStringArray(body.instructions),
  category: body.category ? String(body.category).trim() : "Okategoriserat",
  image: body.image ? String(body.image).trim() : "",
  source_image: body.source_image ? String(body.source_image).trim() : "",
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const recipeData = normalizeRecipeInput(req.body);

  if (!recipeData.name || recipeData.ingredients.length === 0) {
    return res.status(400).json({
      message: "Namn och minst en ingrediens krävs.",
    });
  }

  const recipe = new Recipe({
    ...recipeData,
    createdAt: new Date(),
  });

  try {
    const newRecipe = await recipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData = normalizeRecipeInput(req.body);

  if (!updatedData.name || updatedData.ingredients.length === 0) {
    return res.status(400).json({
      message: "Namn och minst en ingrediens krävs.",
    });
  }

  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (!updatedRecipe) {
      return res.status(404).json({ message: "Receptet hittades inte." });
    }
    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
      return res.status(404).json({ message: "Receptet hittades inte." });
    }
    res.json({ message: "Receptet har tagits bort." });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Receptet hittades inte." });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
