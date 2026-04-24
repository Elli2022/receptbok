import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Login = () => {
  const router = useRouter();
  const nextPath = typeof router.query.next === "string" ? router.query.next : "/recept";
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Inloggningen misslyckades.");
      }

      router.push(nextPath);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Inloggningen misslyckades. Kontrollera dina uppgifter."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-12">
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Konto
          </p>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">Logga in</h1>
          <p className="mt-3 text-stone-600">
            Logga in för att lägga till egna recept och spara favoriter.
          </p>

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
                className="rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
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
                className="rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loggar in..." : "Logga in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-stone-600">
            Har du inget konto?{" "}
            <Link
              href={`/register?next=${encodeURIComponent(nextPath)}`}
              className="font-semibold text-emerald-700"
            >
              Registrera dig
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
