"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/app/components/Footer";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { notifyAuthChange } from "@/lib/auth/local-user";

const AuthCallbackClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") ?? "/recept";
  const error = (() => {
    if (typeof window === "undefined") {
      return "";
    }

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const errorDescription = hashParams.get("error_description");
    return errorDescription ? errorDescription.replace(/\+/g, " ") : "";
  })();

  useEffect(() => {
    if (error) {
      return;
    }

    getSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session?.user) {
          localStorage.setItem(
            "receptbok.user",
            JSON.stringify({
              id: data.session.user.id,
              email: data.session.user.email,
              name: data.session.user.user_metadata?.name,
              username: data.session.user.user_metadata?.username,
            })
          );
          notifyAuthChange();
          router.replace(nextPath);
          return;
        }

        router.replace(`/login?confirmed=1&next=${encodeURIComponent(nextPath)}`);
      })
      .catch(() => {
        router.replace(`/login?confirmed=1&next=${encodeURIComponent(nextPath)}`);
      });
  }, [error, nextPath, router]);

  return (
    <>
      <main className="mx-auto max-w-lg px-4 py-12">
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Konto
          </p>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">Bekräftar e-post</h1>
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
    </>
  );
};

export default AuthCallbackClient;
