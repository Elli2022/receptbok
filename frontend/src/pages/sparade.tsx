import React, { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  Recipe,
  getLocalRecipes,
  mergeRecipes,
  normalizeRecipe,
  recipeImage,
  saveLocalRecipeCopy,
} from "@/lib/recipes";
import { getStoredUser } from "@/lib/auth/local-user";
import { useLoggedIn } from "@/lib/auth/use-logged-in";

type Props = {
  recipes: Recipe[];
};

const getBaseUrl = (req: any) => {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  return `${protocol}://${req.headers.host}`;
};

export async function getServerSideProps({ req }: { req: any }) {
  try {
    const response = await fetch(`${getBaseUrl(req)}/api/recipes`);
    const data = await response.json();

    return {
      props: {
        recipes: Array.isArray(data) ? data.map(normalizeRecipe) : [],
      },
    };
  } catch {
    return {
      props: { recipes: [] },
    };
  }
}

const SparadePage = ({ recipes }: Props) => {
  const [localRecipes, setLocalRecipesState] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const isLoggedIn = useLoggedIn();

  React.useEffect(() => {
    setLocalRecipesState(getLocalRecipes());
  }, []);

  React.useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    (async () => {
      try {
        const response = await fetch("/api/favorites", { credentials: "include" });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setFavoriteIds(Array.isArray(data.recipeIds) ? data.recipeIds : []);
      } catch {
        // ignore
      }
    })();
  }, [isLoggedIn]);

  const allRecipes = useMemo(
    () => mergeRecipes(localRecipes, recipes),
    [localRecipes, recipes]
  );

  const savedRecipes = useMemo(
    () =>
      allRecipes.filter(
        (recipe) => favoriteIds.includes(recipe._id) || recipe.localOnly
      ),
    [allRecipes, favoriteIds]
  );

  const onToggleFavorite = (recipeId: string) => {
    if (!isLoggedIn) {
      return;
    }
    (async () => {
      try {
        const response = await fetch(`/api/favorites/${recipeId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) {
          return;
        }
        setFavoriteIds((current) => current.filter((id) => id !== recipeId));
      } catch {
        // ignore
      }
    })();
  };

  const onCreateMyVersion = (recipe: Recipe) => {
    if (!isLoggedIn) {
      return;
    }
    const localCopy = saveLocalRecipeCopy(recipe, {
      ownerUserId: getStoredUser()?.id,
    });
    setLocalRecipesState((current) => [localCopy, ...current]);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

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

        {!isLoggedIn ? (
          <section className="mt-8 rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-stone-950">Logga in för sparade recept</h2>
            <p className="mt-2 text-stone-600">
              Sparade favoriter ar kopplade till ditt konto i inloggat lage.
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
                  <img
                    src={recipeImage(recipe)}
                    alt={recipe.name}
                    className="h-56 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = "/images/heroImageLandingPage.jpg";
                    }}
                  />
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

export default SparadePage;
