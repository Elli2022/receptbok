//backend/server.js
// dotenv kongifuarion i toppen av filen för att säkerställa att miljövariablerna från .env laddas innan de används
require("dotenv").config(); // Laddar miljövariabler från .env-filen
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json()); // Middleware för att tolka JSON

// Anslut till MongoDB med Mongoose
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error("Error connecting to MongoDB", error));

// Grundläggande välkomstmeddelande
app.get("/", (req, res) => {
  res.send("Välkommen till min receptbok backend!");
});

// Importera och använd recept-routes
const recipesRouter = require("../backend/routes/recipe");
app.use("/recipes", recipesRouter);

// Starta servern
app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});
