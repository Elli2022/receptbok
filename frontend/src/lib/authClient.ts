import { getSupabaseBrowserClient } from "./supabaseClient";

type ProfileResult = {
  name?: string | null;
  username?: string | null;
} | null;

type FavoriteResult = {
  recipe_id: string;
};

export type CurrentUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  favoriteIds: string[];
};

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const supabase = getSupabaseBrowserClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session?.user) {
    return null;
  }

  const [{ data: profile }, { data: favorites }] = await Promise.all([
    supabase
      .from("profiles")
      .select("name,username")
      .eq("id", session.user.id)
      .maybeSingle(),
    (supabase as any).rpc("list_user_favorite_ids"),
  ]);
  const profileResult = profile as ProfileResult;
  const favoriteResults = (favorites || []) as FavoriteResult[];

  return {
    id: session.user.id,
    name:
      profileResult?.name ||
      String(session.user.user_metadata?.name || session.user.email || "Receptvän"),
    username:
      profileResult?.username ||
      String(session.user.user_metadata?.username || session.user.email || "receptvan"),
    email: session.user.email || "",
    favoriteIds: favoriteResults.map((favorite) => String(favorite.recipe_id)),
  };
};

export const loginRedirect = (nextPath: string) =>
  `/login?next=${encodeURIComponent(nextPath)}`;
