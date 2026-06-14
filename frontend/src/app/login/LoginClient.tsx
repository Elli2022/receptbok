"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/app/components/Footer";
import AuthShell from "@/app/components/AuthShell";
import { notifyAuthChange } from "@/lib/auth/local-user";
import { authButtonClassName, authInputClassName } from "@/lib/auth/input-styles";

const LoginClient = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") ?? "/recept";
  const resetSuccess = searchParams?.get("reset") === "1";

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || data.message || "Inloggningen misslyckades.");
      }

      localStorage.setItem("receptbok.user", JSON.stringify(data.user));
      notifyAuthChange();
      router.push(nextPath);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Inloggningen misslyckades. Kontrollera dina uppgifter."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthShell
        eyebrow="Välkommen tillbaka"
        title="Logga in"
        intro="Logga in för att spara favoriter och synka recept mellan enheter."
      >
        {resetSuccess && (
          <p className="mt-5 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Lösenordet är uppdaterat. Logga in med ditt nya lösenord.
          </p>
        )}
        {error && (
          <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            E-post
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              required
              autoComplete="email"
              className={authInputClassName}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Lösenord
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              required
              autoComplete="current-password"
              className={authInputClassName}
            />
          </label>
          <p className="text-right text-sm">
            <Link href="/forgot-password" className="font-semibold text-emerald-700">
              Glömt lösenord?
            </Link>
          </p>
          <button type="submit" disabled={loading} className={authButtonClassName}>
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-600">
          Inget konto?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-emerald-700"
          >
            Skapa konto
          </Link>
        </p>
      </AuthShell>
      <Footer />
    </>
  );
};

export default LoginClient;
