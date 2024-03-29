//backend/server.ts
// dotenv kongifuarion i toppen av filen för att säkerställa att miljövariablerna från .env laddas innan de används
// Importerar nödvändiga moduler och typer

import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";

// Konfigurerar dotenv för att ladda miljövariabler från .env-filen
dotenv.config();

const cors = require("cors");
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // Middleware för att tolka JSON

// Ansluter till MongoDB med Mongoose
mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error: any) => console.error("Error connecting to MongoDB", error));

// Grundläggande välkomstmeddelande
app.get("/", (req: Request, res: Response) => {
  res.send("Välkommen till min receptbok backend!");
});

// Importerar och använder recept-routes
import recipesRouter from "./routes/recipe";
app.use("/recipes", recipesRouter);

// Startar servern
app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});
