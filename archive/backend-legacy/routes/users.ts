//backend/routes/users.ts
import express, { Request, Response } from "express";
import Users from "../models/Users";

const router = express.Router();

// GET / - Hämta alla användare
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await Users.find().select("-password");
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

    // Skapa en ny användare
    const newUser = new Users({
      name,
      username,
      email,
      password,
    });

    // Spara användaren i databasen
    const savedUser = await newUser.save();
    const safeUser = {
      id: savedUser._id,
      name: savedUser.name,
      username: savedUser.username,
      email: savedUser.email,
      favorites: savedUser.favorites,
    };

    res.status(201).json({ msg: "Användare registrerad", user: safeUser });
  } catch (error) {
    console.error("Error i POST /api/users:", error);
    res.status(500).json({ message: "Serverfel vid registrering." });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ email });
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({ msg: "Fel e-post eller lösenord." });
    }

    res.json({
      msg: "Inloggning lyckades",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        favorites: user.favorites,
      },
    });
  } catch (error) {
    console.error("Error i POST /api/users/login:", error);
    res.status(500).json({ message: "Serverfel vid inloggning." });
  }
});

export default router;
