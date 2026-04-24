import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { connectToDatabase, hasDatabaseUrl } from "@/lib/server/db";
import { publicUser, setSessionCookie } from "@/lib/server/auth";
import { UserModel } from "@/lib/server/models";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!hasDatabaseUrl()) {
    return res.status(503).json({
      message: "Databasen är inte kopplad ännu. Lägg till DATABASE_URL i Netlify.",
    });
  }

  await connectToDatabase();

  if (req.method === "POST") {
    const name = String(req.body?.name || "").trim();
    const username = String(req.body?.username || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!name || !username || !email || password.length < 6) {
      return res.status(400).json({
        message: "Fyll i namn, användarnamn, e-post och minst 6 tecken lösenord.",
      });
    }

    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Det finns redan en användare med den e-posten eller användarnamnet.",
      });
    }

    const user = await UserModel.create({
      name,
      username,
      email,
      password: await bcrypt.hash(password, 12),
      favorites: [],
    });

    setSessionCookie(res, user);
    return res.status(201).json({ user: publicUser(user) });
  }

  if (req.method === "GET") {
    const users = await UserModel.find({}).select("name username").lean();
    return res.status(200).json(users);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Metoden är inte tillåten." });
}
