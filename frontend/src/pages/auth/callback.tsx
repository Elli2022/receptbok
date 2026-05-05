import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const AuthCallback = () => {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const nextPath = typeof router.query.next === "string" ? router.query.next : "/recept";
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const errorDescription = hashParams.get("error_description");

    if (errorDescription) {
      setError(errorDescription.replace(/\+/g, " "));
      return;
    }

    getSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          router.replace(nextPath);
          return;
        }

        router.replace(`/login?confirmed=1&next=${encodeURIComponent(nextPath)}`);
      })
      .catch(() => {
        router.replace(`/login?confirmed=1&next=${encodeURIComponent(nextPath)}`);
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-12">
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Konto
          </p>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">
            Bekräftar e-post
          </h1>
          {error ? (
            <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : (
            <p className="mt-3 text-stone-600">
              Vänta lite, vi loggar in dig och skickar dig vidare.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AuthCallback;
