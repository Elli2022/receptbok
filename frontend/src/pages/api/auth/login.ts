import type { NextApiRequest, NextApiResponse } from "next";
import {
  createSupabaseServerClient,
  hasSupabaseConfig,
} from "@/lib/server/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  }

  if (!hasSupabaseConfig()) {
    return res.status(503).json({
      message: "Supabase är inte kopplat ännu. Lägg till Supabase-nycklarna i Netlify.",
    });
  }

  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const supabase = createSupabaseServerClient(req);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return res.status(401).json({ message: "Fel e-post eller lösenord." });
  }

  return res.status(200).json({ session: data.session, user: data.user });
}
