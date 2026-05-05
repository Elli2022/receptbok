import { useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT, getStoredUser } from "./local-user";

/**
 * Samma som localStorage-flaggan receptbok.user (UI), med listeners vid inloggning.
 * SSR/hydration: börjar som false, uppdateras i useEffect (ingen mismatch).
 */
export function useLoggedIn(): boolean {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const sync = () => setIsLoggedIn(Boolean(getStoredUser()));
    sync();
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return isLoggedIn;
}
