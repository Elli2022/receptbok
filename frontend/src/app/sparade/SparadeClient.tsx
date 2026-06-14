"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Footer from "@/app/components/Footer";
import RecipeImage from "@/app/components/RecipeImage";
import RecipeListSkeleton from "@/app/components/RecipeListSkeleton";
import { Recipe, enrichRecipe, recipeImage, saveLocalRecipeCopy } from "@/lib/recipes";
import { getStoredUser } from "@/lib/auth/local-user";
import { useLoggedIn } from "@/lib/auth/use-logged-in";
import { removeFavoriteId } from "@/lib/favorites-cache";
import {
  fetchFavoriteRecipes,
  peekFavoriteRecipes,
  removeFavoriteRecipe,
} from "@/lib/favorites-recipes-cache";
import { useLocalRecipes } from "@/lib/use-local-recipes";

const SparadeClient = () => {
  const isLoggedIn = useLoggedIn();
  const cachedFavorites = isLoggedIn ? peekFavoriteRecipes() : undefined;

  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>(cachedFavorites ?? []);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(cachedFavorites === undefined);
  const localRecipes = useLocalRecipes();

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let cancelled = false;
    void fetchFavoriteRecipes().then((recipes) => {
      if (!cancelled) {
        setFavoriteRecipes(recipes);
        setIsLoadingRecipes(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const savedRecipes = useMemo(() => {
    const remote = favoriteRecipes.map(enrichRecipe);
    const remoteIds = new Set(remote.map((recipe) => recipe._id));
    const localOnly = localRecipes.filter(
      (recipe) => recipe.localOnly && !remoteIds.has(recipe._id)
    );
    return [...localOnly, ...remote];
  }, [favoriteRecipes, localRecipes]);

  const showSkeleton = isLoggedIn && savedRecipes.length === 0 && isLoadingRecipes;

  const onToggleFavorite = (recipeId: string) => {
    if (!isLoggedIn) return;
    void (async () => {
      try {
        const response = await fetch(`/api/favorites/${recipeId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) return;
        removeFavoriteId(recipeId);
        removeFavoriteRecipe(recipeId);
        setFavoriteRecipes((current) =>
          current.filter((recipe) => recipe._id !== recipeId)
        );
      } catch {
        // ignore
      }
    })();
  };

  const onCreateMyVersion = (recipe: Recipe) => {
    if (!isLoggedIn) return;
    saveLocalRecipeCopy(recipe, { ownerUserId: getStoredUser()?.id });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <section className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Sparade recept
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">
            Dina favoriter och egna recept.
          </h1>
          <p className="mt-4 text-lg leading-8 text-stone-700">
            Här samlas recepten du har sparat och recepten du har lagt till på
            enheten.
          </p>
        </section>

        {showSkeleton ? (
          <RecipeListSkeleton count={3} />
        ) : !isLoggedIn ? (
          <section className="mt-8 rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-stone-950">Logga in för sparade recept</h2>
            <p className="mt-2 text-stone-600">
              Sparade favoriter är kopplade till ditt konto i inloggat läge.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
            >
              Logga in
            </Link>
          </section>
        ) : savedRecipes.length > 0 ? (
          <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedRecipes.map((recipe) => (
              <article
                key={recipe._id}
                className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <Link href={`/recept/${recipe._id}`} className="block">
                  <RecipeImage src={recipeImage(recipe)} alt={recipe.name} />
                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      <span>{recipe.category || "Okategoriserat"}</span>
                      {recipe.localOnly && <span>Lokalt</span>}
                    </div>
                    <h2 className="text-xl font-bold text-stone-950">{recipe.name}</h2>
                    {recipe.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
                        {recipe.description}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(recipe._id)}
                    aria-label="Ta bort från sparade"
                    className="text-2xl leading-none text-rose-600 transition hover:text-rose-700"
                  >
                    ♥
                  </button>
                  <button
                    type="button"
                    onClick={() => onCreateMyVersion(recipe)}
                    className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:border-emerald-700 hover:text-emerald-800"
                  >
                    Egen version
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-8 rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-stone-950">
              Du har inga sparade recept än
            </h2>
            <p className="mt-2 text-stone-600">
              Gå till receptsidan och spara dina favoriter.
            </p>
            <Link
              href="/recept"
              className="mt-5 inline-flex rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
            >
              Visa recept
            </Link>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SparadeClient;
