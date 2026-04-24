import type { NextApiRequest, NextApiResponse } from "next";
import { clearSessionCookie } from "@/lib/server/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  }

  clearSessionCookie(res);
  return res.status(200).json({ message: "Du är utloggad." });
}
