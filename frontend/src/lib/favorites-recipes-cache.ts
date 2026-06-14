import { getStoredUser } from "@/lib/auth/local-user";
import type { Recipe } from "@/lib/recipes";

const CACHE_TTL_MS = 5 * 60_000;
const STORAGE_KEY = "receptbok.favorite-recipes.v1";

let cachedRecipes: Recipe[] | null = null;
let cachedUserId: string | null = null;
let cachedAt = 0;
let inflight: Promise<Recipe[]> | null = null;

type SessionPayload = {
  recipes?: Recipe[];
  userId?: string;
  at?: number;
};

function currentUserId(): string | null {
  return getStoredUser()?.id ?? null;
}

function readSessionCache(): Recipe[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const userId = currentUserId();
  if (!userId) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as SessionPayload;
    if (
      !parsed.recipes ||
      !parsed.at ||
      parsed.userId !== userId ||
      Date.now() - parsed.at > CACHE_TTL_MS
    ) {
      return null;
    }
    return parsed.recipes;
  } catch {
    return null;
  }
}

function writeSessionCache(recipes: Recipe[], userId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ recipes, userId, at: Date.now() })
    );
  } catch {
    // sessionStorage kan vara full eller blockerad
  }
}

export function peekFavoriteRecipes(): Recipe[] | undefined {
  const userId = currentUserId();
  if (!userId) {
    return undefined;
  }

  if (cachedRecipes && cachedUserId === userId && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedRecipes;
  }

  const fromSession = readSessionCache();
  if (fromSession) {
    cachedRecipes = fromSession;
    cachedUserId = userId;
    cachedAt = Date.now();
    return fromSession;
  }

  return undefined;
}

export function stashFavoriteRecipes(recipes: Recipe[]): void {
  const userId = currentUserId();
  if (!userId) {
    return;
  }

  cachedRecipes = recipes;
  cachedUserId = userId;
  cachedAt = Date.now();
  writeSessionCache(recipes, userId);
}

export function clearFavoriteRecipesCache(): void {
  cachedRecipes = null;
  cachedUserId = null;
  cachedAt = 0;
  inflight = null;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export function prefetchFavoriteRecipes(): void {
  if (currentUserId()) {
    void fetchFavoriteRecipes();
  }
}

export async function fetchFavoriteRecipes(): Promise<Recipe[]> {
  const userId = currentUserId();
  if (!userId) {
    return [];
  }

  const cached = peekFavoriteRecipes();
  if (cached) {
    return cached;
  }

  if (inflight) {
    return inflight;
  }

  inflight = (async () => {
    try {
      const response = await fetch("/api/favorites/recipes", {
        credentials: "include",
      });
      if (response.status === 401) {
        clearFavoriteRecipesCache();
        return [];
      }
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      const recipes = Array.isArray(data.recipes) ? data.recipes : [];
      stashFavoriteRecipes(recipes);
      return recipes;
    } catch {
      return [];
    }
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function removeFavoriteRecipe(recipeId: string): void {
  const current = peekFavoriteRecipes() ?? [];
  stashFavoriteRecipes(current.filter((recipe) => recipe._id !== recipeId));
}
