"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="sv">
      <body className="bg-stone-50 text-stone-950">
        <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
            Kritiskt fel
          </p>
          <h1 className="mt-3 text-3xl font-bold">Något gick fel</h1>
          <p className="mt-4 text-stone-600">
            Appen kunde inte laddas. Prova att ladda om sidan.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
          >
            Ladda om
          </button>
        </main>
      </body>
    </html>
  );
}
