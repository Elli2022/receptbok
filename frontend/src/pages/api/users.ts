import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { rejectOversizedBody } from "@/lib/api/request-guards";
import { validateRegistrationFields } from "@/lib/api/validate-auth";
import {
  getSupabasePublicKey,
  getSupabaseUrl,
  hasSupabasePublicConfig,
} from "@/lib/supabase/env";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!hasSupabasePublicConfig()) {
    return res.status(503).json({ msg: "Supabase är inte konfigurerad." });
  }

  const url = getSupabaseUrl();
  const anon = getSupabasePublicKey();

  if (req.method === "GET") {
    return res.status(200).json([]);
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Metoden ${req.method} är inte tillåten.`);
  }

  if (rejectOversizedBody(req, res, 4_096)) {
    return;
  }
  if (
    !enforceRateLimit(req, res, {
      scope: "auth-register",
      limit: 5,
      windowMs: 60 * 60_000,
    })
  ) {
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const validationError = validateRegistrationFields(body);
  if (validationError) {
    return res.status(400).json({ msg: validationError });
  }

  const { name, username, email, password } = body;

  try {
    const supabaseAnon = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabaseAnon.auth.signUp({
      email: String(email),
      password: String(password),
      options: {
        data: {
          name: String(name),
          username: String(username),
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        return res.status(400).json({ msg: "Användaren finns redan" });
      }
      return res.status(400).json({ msg: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ msg: "Kunde inte skapa användare." });
    }

    const admin = getSupabaseAdmin();
    let favorites: string[] = [];

    const { data: profile, error: profileError } = admin
      ? await admin.from("profiles").select("favorites").eq("id", data.user.id).maybeSingle()
      : { data: null, error: null };

    if (profileError) {
      console.error("register profile fetch:", profileError);
    }

    if (profile?.favorites) {
      favorites = profile.favorites;
    }

    return res.status(201).json({
      msg: "Användare registrerad",
      user: {
        id: data.user.id,
        name: String(name),
        username: String(username),
        email: data.user.email,
        favorites,
      },
    });
  } catch (e) {
    console.error("POST /api/users:", e);
    return res.status(500).json({ message: "Serverfel vid registrering." });
  }
}
