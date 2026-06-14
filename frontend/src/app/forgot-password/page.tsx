"use client";

import React, { useState } from "react";
import Link from "next/link";
import Footer from "@/app/components/Footer";
import AuthShell from "@/app/components/AuthShell";
import { getPasswordResetRedirectUrl } from "@/lib/auth/site-url";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabaseClient";
import { authButtonClassName, authInputClassName } from "@/lib/auth/input-styles";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!hasSupabaseConfig()) {
      setError("Supabase Auth är inte konfigurerad.");
      setLoading(false);
      return;
    }

    try {
      const redirectTo = getPasswordResetRedirectUrl(window.location.origin);
      const { error: resetError } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );

      if (resetError) {
        throw new Error(resetError.message || "Kunde inte skicka återställningsmejl.");
      }

      setMessage(
        "Om e-postadressen är registrerad skickar vi en länk för att välja nytt lösenord."
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Kunde inte skicka återställningsmejl."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthShell
        eyebrow="Återställning"
        title="Glömt lösenord?"
        intro="Ange din e-post så skickar vi en länk där du kan välja ett nytt lösenord."
      >
        {error && (
          <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-5 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {message}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            E-post
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className={authInputClassName}
            />
          </label>
          <button type="submit" disabled={loading} className={authButtonClassName}>
            {loading ? "Skickar..." : "Skicka återställningslänk"}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-600">
          <Link href="/login" className="font-semibold text-emerald-700">
            ← Tillbaka till inloggning
          </Link>
        </p>
      </AuthShell>
      <Footer />
    </>
  );
}
