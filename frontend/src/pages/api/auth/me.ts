import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser, publicUser } from "@/lib/server/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  }

  const user = await getCurrentUser(req);

  if (!user) {
    return res.status(200).json({ user: null });
  }

  return res.status(200).json({ user: publicUser(user) });
}
