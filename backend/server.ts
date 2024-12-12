// backend/server.ts
// dotenv konfiguration i toppen av filen för att säkerställa att miljövariablerna från .env laddas innan de används
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import cors from "cors";
import fs from "fs";
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
console.log("PORT", 3001)

// Resten av din server.ts-fil

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// MongoDB-anslutning
mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error: any) => console.error("Error connecting to MongoDB", error));

// Log request method and URL ( Middleware för loggning)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if(req.method === "POST" || req.method === "PUT"){
    console.log("Body:", req.body);
  }
  next();
});

app.use("/users", (req, res) => {
  console.log("Felaktig endpoint användes: /users");
  res.status(404).json({ error: "Använd /api/users istället för /users." });
});


// Ställ in public-mappen för statiska filer
app.use("/public", express.static(path.join(__dirname, "public")));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
// Lägg till detta för att servera statiska filer från 'uploads'-mappen
app.use("/images", express.static(path.join(__dirname, "uploads")));



// Routes
import usersRouter from "./routes/users";
app.use("/api/users", usersRouter);

// Importerar och använder recept-routes
import recipesRouter from "./routes/recipe";
app.use("/recipes", recipesRouter);

// Importerar och använder imageUpload-routes
import imageUploadRouter from "./routes/imageUpload";
app.use("/images", imageUploadRouter);

// Testroute
app.get("/", (req: Request, res: Response) => {
  res.send("Välkommen till min receptbok backend!");
});

// Global felhanterare
app.use((err: any, req: Request, res: Response, next: Function) =>{
  console.error("Ett oväntat fel inträffade: ", err);
  res.status(500).json({message: "Ett serverfel inträffade. Försök igen senarare. "});
})


app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});
