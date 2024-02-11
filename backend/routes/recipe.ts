import express, { Request, Response } from "express";
import Recipe from "../models/Recipe"; // Antag att din Recipe-modell är korrekt konverterad till TypeScript.

// Skapa en ny router-instans som kommer att hantera alla routes för "recipes".
const router = express.Router();

// Definierar en GET-route som fångar förfrågningar till root URL ("/") för "recipes".
router.get("/", async (req: Request, res: Response) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Definiera en POST-route för att skapa ett nytt recept.
router.post("/", async (req: Request, res: Response) => {
  const recipe = new Recipe({
    name: req.body.name,
    description: req.body.description,
    ingredients: req.body.ingredients,
    instructions: req.body.instructions,
  });

  try {
    const newRecipe = await recipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// PUT för att uppdatera ett befintligt recept baserat på ID
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

// DELETE för att ta bort ett recept baserat på ID
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

export default router; // Använd 'export default' för ES6-moduler.
