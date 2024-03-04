//backend/routes/users.ts
import express, { Request, Response } from "express";
import Users from "../models/Users";

const router = express.Router();

router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});
