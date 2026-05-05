import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabasePagesApiClient } from "@/lib/supabase/pages-api-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return res.status(503).json({ message: "Supabase Auth är inte konfigurerad." });
  }

  try {
    const supabase = createSupabasePagesApiClient(req, res);
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ msg: "E-post och lösenord krävs." });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email),
      password: String(password),
    });

    if (error || !data.user) {
      return res.status(401).json({ msg: "Fel e-post eller lösenord." });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, username, favorites")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("login profile fetch:", profileError);
    }

    return res.status(200).json({
      msg: "Inloggning lyckades",
      user: {
        id: data.user.id,
        name: profile?.name ?? "",
        username: profile?.username ?? "",
        email: data.user.email,
        favorites: profile?.favorites ?? [],
      },
    });
  } catch (e) {
    return res.status(500).json({
      message: "Kunde inte logga in.",
      error: e instanceof Error ? e.message : "Okänt fel",
    });
  }
}
