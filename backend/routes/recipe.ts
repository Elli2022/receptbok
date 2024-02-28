// backend/routes/recipe.ts
import express, { Request, Response } from "express";
import Recipe from "../models/Recipe";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const recipe = new Recipe({
    name: req.body.name,
    description: req.body.description,
    portions: req.body.portions,
    ingredients: req.body.ingredients,
    instructions: req.body.instructions,
    category: req.body.category,
    image: req.body.image, // Sparar bild-URLen
    source_image: req.body.source_image,
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
  const updatedData = req.body;

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
    const deletedRecipe = await Recipe.findByIdAndRemove(id);
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
