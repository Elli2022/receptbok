"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/app/components/Footer";
import ResetPasswordModal from "@/app/components/ResetPasswordModal";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabaseClient";

const ResetPasswordClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabaseConfigured = hasSupabaseConfig();
  const [ready, setReady] = useState(!supabaseConfigured);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(
    supabaseConfigured ? null : "Supabase Auth är inte konfigurerad."
  );
  const [completed, setCompleted] = useState(false);

  const code = searchParams?.get("code");
  const tokenHash = searchParams?.get("token_hash");
  const queryType = searchParams?.get("type");

  useEffect(() => {
    if (!supabaseConfigured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    const finishWithSession = () => {
      window.history.replaceState({}, document.title, window.location.pathname);
      setModalOpen(true);
      setError(null);
      setReady(true);
    };

    const fail = (message: string) => {
      setError(message);
      setReady(true);
    };

    const openFromLink = async () => {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashType = hashParams.get("type");

      if (hashType === "recovery" && accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          fail(sessionError.message);
          return;
        }

        finishWithSession();
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          fail(exchangeError.message);
          return;
        }

        finishWithSession();
        return;
      }

      if (tokenHash && queryType === "recovery") {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });

        if (verifyError) {
          fail(verifyError.message);
          return;
        }

        finishWithSession();
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setModalOpen(true);
      }

      setReady(true);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setModalOpen(true);
        setError(null);
      }
    });

    void openFromLink();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseConfigured, code, tokenHash, queryType]);

  const onSuccess = async () => {
    setCompleted(true);
    setModalOpen(false);
    await getSupabaseBrowserClient().auth.signOut();
    setTimeout(() => {
      router.replace("/login?reset=1");
    }, 1200);
  };

  return (
    <>
      <main className="mx-auto max-w-lg px-4 py-12">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Lösenord
          </p>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">Återställ lösenord</h1>

          {!ready ? (
            <p className="mt-3 text-stone-600">Verifierar länken...</p>
          ) : completed ? (
            <p className="mt-5 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              Lösenordet är uppdaterat. Skickar dig till inloggning...
            </p>
          ) : error ? (
            <>
              <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
              <p className="mt-6 text-sm text-stone-600">
                <Link href="/forgot-password" className="font-semibold text-emerald-700">
                  Begär en ny återställningslänk
                </Link>
              </p>
            </>
          ) : modalOpen ? (
            <p className="mt-3 text-stone-600">
              Fyll i ditt nya lösenord i rutan som öppnades.
            </p>
          ) : (
            <>
              <p className="mt-3 text-stone-600">
                Länken är ogiltig eller har gått ut. Begär en ny återställning via e-post.
              </p>
              <p className="mt-6 text-sm text-stone-600">
                <Link href="/forgot-password" className="font-semibold text-emerald-700">
                  Skicka ny återställningslänk
                </Link>
              </p>
            </>
          )}
        </section>
      </main>

      <ResetPasswordModal
        open={modalOpen && !completed}
        onClose={() => setModalOpen(false)}
        onSuccess={() => void onSuccess()}
      />

      <Footer />
    </>
  );
};

export default ResetPasswordClient;
