import type { NextApiRequest, NextApiResponse } from "next";
import {
  createSupabaseServerClient,
  hasSupabaseConfig,
} from "@/lib/server/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!hasSupabaseConfig()) {
    return res.status(503).json({
      message: "Supabase är inte kopplat ännu. Lägg till Supabase-nycklarna i Netlify.",
    });
  }

  const supabase = createSupabaseServerClient(req);

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, username },
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json({ session: data.session, user: data.user });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,name,username")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(503).json({ message: error.message });
    }

    return res.status(200).json(data || []);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Metoden är inte tillåten." });
}
