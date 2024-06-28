//backend/server.ts
// dotenv konfiguration i toppen av filen för att säkerställa att miljövariablerna från .env laddas innan de används
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error: any) => console.error("Error connecting to MongoDB", error));

app.get("/", (req: Request, res: Response) => {
  res.send("Välkommen till min receptbok backend!");
});

// Ställ in public-mappen för statiska filer
app.use('/public', express.static(path.join(__dirname, 'public')));

// Importerar och använder recept-routes
import recipesRouter from "./routes/recipe";
app.use("/recipes", recipesRouter);

// Importerar och använder imageUpload-routes
import imageUploadRouter from "./routes/imageUpload";
app.use("/images", imageUploadRouter);

app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


