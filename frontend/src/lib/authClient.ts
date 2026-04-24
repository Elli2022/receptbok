export type CurrentUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  favoriteIds: string[];
};

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const response = await fetch("/api/auth/me");

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.user || null;
};

export const loginRedirect = (nextPath: string) =>
  `/login?next=${encodeURIComponent(nextPath)}`;
