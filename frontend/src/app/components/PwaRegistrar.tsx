"use client";

import { useEffect } from "react";

const PwaRegistrar = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Appen fungerar fortfarande om webbläsaren nekar service workers.
    });
  }, []);

  return null;
};

export default PwaRegistrar;
