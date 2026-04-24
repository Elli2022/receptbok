import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { connectToDatabase, hasDatabaseUrl } from "@/lib/server/db";
import { publicUser, setSessionCookie } from "@/lib/server/auth";
import { UserModel } from "@/lib/server/models";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  }

  if (!hasDatabaseUrl()) {
    return res.status(503).json({
      message: "Databasen är inte kopplad ännu. Lägg till DATABASE_URL i Netlify.",
    });
  }

  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  await connectToDatabase();
  const user = await UserModel.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Fel e-post eller lösenord." });
  }

  setSessionCookie(res, user);
  return res.status(200).json({ user: publicUser(user) });
}
