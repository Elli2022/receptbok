//backend/server.ts
// dotenv kongifuarion i toppen av filen för att säkerställa att miljövariablerna från .env laddas innan de används
// Importera nödvändiga moduler och typer
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";

// Konfigurera dotenv för att ladda miljövariabler från .env-filen
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json()); // Middleware för att tolka JSON

// Anslut till MongoDB med Mongoose
mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error: any) => console.error("Error connecting to MongoDB", error));

// Grundläggande välkomstmeddelande
app.get("/", (req: Request, res: Response) => {
  res.send("Välkommen till min receptbok backend!");
});

// Importera och använd recept-routes
import recipesRouter from "./routes/recipe"; // Ändra './routes/recipe' till korrekt sökväg baserat på din filstruktur
app.use("/recipes", recipesRouter);

// Starta servern
app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});
