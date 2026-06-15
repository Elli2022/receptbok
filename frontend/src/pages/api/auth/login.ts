import type { NextApiRequest, NextApiResponse } from "next";
import * as Sentry from "@sentry/nextjs";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { rejectOversizedBody } from "@/lib/api/request-guards";
import { validateEmail, validatePassword } from "@/lib/api/validate-auth";
import { createSupabasePagesApiClient } from "@/lib/supabase/pages-api-client";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  }

  if (!hasSupabasePublicConfig()) {
    return res.status(503).json({ message: "Supabase Auth är inte konfigurerad." });
  }

  try {
    if (rejectOversizedBody(req, res, 4_096)) {
      return;
    }
    if (
      !enforceRateLimit(req, res, {
        scope: "auth-login",
        limit: 10,
        windowMs: 15 * 60_000,
      })
    ) {
      return;
    }

    const supabase = createSupabasePagesApiClient(req, res);
    const { email, password } = req.body ?? {};

    const validationError =
      validateEmail(email) ?? validatePassword(password);
    if (validationError) {
      return res.status(400).json({ msg: validationError });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
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
    Sentry.captureException(e);
    return res.status(500).json({
      message: "Kunde inte logga in.",
      error: e instanceof Error ? e.message : "Okänt fel",
    });
  }
}
