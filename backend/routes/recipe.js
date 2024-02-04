//backend/routes/recipe.js

// Importera Express-biblioteket för att använda dess router-funktionalitet.
const express = require("express");

// Skapa en ny router-instans som kommer att hantera alla routes för "recipes".
const router = express.Router();

// Importera Recipe-modellen som vi definierade i en annan fil.
// Detta gör att vi kan interagera med "recipes" samlingen i vår MongoDB databas.
const Recipe = require("../models/Recipe");

// Definierar en GET-route som fångar förfrågningar till root URL ("/") för "recipes".
// Detta är avsett för att hämta och returnera en lista med alla recept från databasen.
router.get("/", async (req, res) => {
  // Använder async/await för att hantera asynkron kod. Vi vill vänta på databasens svar.
  try {
    // Använd Recipe-modellen för att hämta alla recept med .find() metoden.
    // .find() utan argument returnerar alla dokument i samlingen.
    const recipes = await Recipe.find();
    // Skicka tillbaka de hittade recepten som svar till klienten.
    res.json(recipes);
  } catch (error) {
    // Om något går fel, skicka ett felmeddelande med statuskoden 500 (Internal Server Error).
    res.status(500).json({ message: error.message });
  }
});

// Definiera en POST-route för att skapa ett nytt recept.
// Detta hanterar inkommande POST-förfrågningar till root URL ("/") för "recipes".
router.post("/", async (req, res) => {
  // Skapa en ny instans av Recipe-modellen med data från förfrågningskroppen (req.body).
  const recipe = new Recipe({
    name: req.body.name,
    description: req.body.description,
    ingredients: req.body.ingredients,
    instructions: req.body.instructions,
  });

  try {
    // Spara det nya receptet i databasen.
    const newRecipe = await recipe.save();
    // Om sparningen lyckas, skicka tillbaka det nyskapade receptet med statuskoden 201 (Created).
    res.status(201).json(newRecipe);
  } catch (error) {
    // Om något går fel, t.ex. om validering misslyckas, skicka ett felmeddelande med statuskoden 400 (Bad Request).
    res.status(400).json({ message: error.message });
  }
});

// PUT för att uppdatera ett befintligt recept baserat på ID
router.put("/:id", async (req, res) => {
  const { id } = req.params; // Hämta ID från URL:en
  const updatedData = req.body; // Hämta uppdaterade data från förfrågningskroppen

  try {
    // Använd Mongoose för att uppdatera receptet baserat på ID
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updatedData, {
      new: true, // Returnera det uppdaterade receptet efter uppdatering
    });

    if (!updatedRecipe) {
      // Om receptet inte hittades, skicka ett felmeddelande med statuskoden 404 (Not Found)
      return res.status(404).json({ message: "Receptet hittades inte." });
    }

    // Skicka det uppdaterade receptet som svar
    res.json(updatedRecipe);
  } catch (error) {
    // Om något går fel, t.ex. om validering misslyckas, skicka ett felmeddelande med statuskoden 400 (Bad Request)
    res.status(400).json({ message: error.message });
  }
});

// DELETE för att ta bort ett recept baserat på ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params; // Hämta ID från URL:en

  try {
    // Använd Mongoose för att ta bort receptet baserat på ID
    const deletedRecipe = await Recipe.findByIdAndRemove(id);

    if (!deletedRecipe) {
      // Om receptet inte hittades, skicka ett felmeddelande med statuskoden 404 (Not Found)
      return res.status(404).json({ message: "Receptet hittades inte." });
    }

    // Skicka ett bekräftelsemeddelande om borttagningen var framgångsrik
    res.json({ message: "Receptet har tagits bort." });
  } catch (error) {
    // Om något går fel, t.ex. om validering misslyckas, skicka ett felmeddelande med statuskoden 400 (Bad Request)
    res.status(400).json({ message: error.message });
  }
});

// Exportera routern så att den kan användas av server.js-filen.
module.exports = router;
