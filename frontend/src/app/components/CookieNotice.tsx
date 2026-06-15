"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

const CONSENT_KEY = "receptbok.cookieConsent.v1";

function subscribe() {
  return () => {};
}

function getConsentVisible() {
  try {
    return window.localStorage.getItem(CONSENT_KEY) !== "accepted";
  } catch {
    return true;
  }
}

const CookieNotice = () => {
  const shouldShow = useSyncExternalStore(subscribe, getConsentVisible, () => false);
  const [dismissed, setDismissed] = useState(false);

  if (!shouldShow || dismissed) {
    return null;
  }

  const accept = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // localStorage kan vara blockerad
    }
    setDismissed(true);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Information om cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-stone-700">
          Vi använder nödvändiga cookies och lokal lagring för inloggning och
          snabbare surfning. Läs mer i vår{" "}
          <Link href="/integritet#cookies" className="font-semibold text-emerald-700">
            integritetspolicy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Jag förstår
        </button>
      </div>
    </div>
  );
};

export default CookieNotice;
