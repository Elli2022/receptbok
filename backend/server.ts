// backend/server.ts
// dotenv konfiguration i toppen av filen för att säkerställa att miljövariablerna från .env laddas innan de används
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

dotenv.config();

// Simulera __dirname i ES-moduler
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME);

// Resten av din server.ts-fil

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error: any) => console.error("Error connecting to MongoDB", error));

// Log request method and URL
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Välkommen till min receptbok backend!");
});

// Ställ in public-mappen för statiska filer
app.use("/public", express.static(path.join(__dirname, "public")));

// Lägg till detta för att servera statiska filer från 'uploads'-mappen
app.use("/images", express.static(path.join(__dirname, "uploads")));

// Importerar och använder recept-routes
import recipesRouter from "./routes/recipe";
app.use("/recipes", recipesRouter);

// Importerar och använder imageUpload-routes
import imageUploadRouter from "./routes/imageUpload";
app.use("/images", imageUploadRouter);

app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});
