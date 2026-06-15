"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function Error({
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
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
        Något gick fel
      </p>
      <h1 className="mt-3 text-3xl font-bold text-stone-950">Kunde inte ladda sidan</h1>
      <p className="mt-4 text-stone-600">
        Ett oväntat fel inträffade. Prova igen eller gå tillbaka till startsidan.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
        >
          Försök igen
        </button>
        <Link
          href="/"
          className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800"
        >
          Till startsidan
        </Link>
      </div>
    </main>
  );
}
