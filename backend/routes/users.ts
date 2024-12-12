//backend/routes/users.ts
import express, { Request, Response } from "express";
import Users from "../models/Users";
import bcrypt from "bcrypt";

const router = express.Router();

// GET / - Hämta alla användare
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST / - Registrera en ny användare
router.post("/", async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;

  try {
    // Kontrollera om användaren redan finns
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Användaren finns redan" });
    }

    // Hasha lösenordet innan det sparas
    const hashedPassword = await bcrypt.hash(password, 12);

    // Skapa en ny användare
    const newUser = new Users({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // Spara användaren i databasen
    const savedUser = await newUser.save();
    res.status(201).json({ msg: "Användare registrerad", user: savedUser });
  } catch (error) {
    console.error("Error i POST /api/users:", error);
    res.status(500).json({ message: "Serverfel vid registrering." });
  }
});

export default router;
