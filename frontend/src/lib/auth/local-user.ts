export type LocalUser = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
};

/** Dispatched after login/logout so sidor kan synka utan full reload. */
export const AUTH_CHANGE_EVENT = "receptbok-auth-change";

export function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export const getStoredUser = (): LocalUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("receptbok.user");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<LocalUser> | null;
    if (!parsed?.id || typeof parsed.id !== "string") {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      username: parsed.username,
      email: parsed.email,
    };
  } catch {
    return null;
  }
};
