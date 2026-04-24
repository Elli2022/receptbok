import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  Recipe,
  normalizeRecipe,
  recipeImage,
} from "@/lib/recipes";
import {
  CurrentUser,
  authFetch,
  getCurrentUser,
  loginRedirect,
} from "@/lib/authClient";

const ReceptDetalj = () => {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setFavoriteIds(currentUser?.favoriteIds || []);
      })
      .catch(() => {
        setUser(null);
        setFavoriteIds([]);
      });
  }, []);

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id || typeof id !== "string") {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/recipes/${id}`);

        if (!response.ok) {
          throw new Error("Receptet kunde inte hämtas.");
        }

        setRecipe(normalizeRecipe(await response.json()));
        setCheckedSteps({});
      } catch {
        setError("Receptet kunde inte hittas.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [id]);

  const completedSteps = useMemo(
    () => Object.values(checkedSteps).filter(Boolean).length,
    [checkedSteps]
  );

  const toggleStep = (index: number) => {
    setCheckedSteps((current) => ({
      ...current,
      [index]: !current[index],
    }));
  };

  const toggleFavorite = async () => {
    if (!recipe) {
      return;
    }

    if (!user) {
      router.push(loginRedirect(`/recept/${recipe._id}`));
      return;
    }

    const isSaved = favoriteIds.includes(recipe._id);
    const response = await authFetch("/api/me/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipeId: recipe._id,
        action: isSaved ? "remove" : "add",
      }),
    });
    const data = await response.json();

    if (response.ok) {
      setFavoriteIds(data.favoriteIds || []);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-16">
          <p className="rounded-lg border border-stone-200 bg-white p-6 text-stone-700">
            Laddar recept...
          </p>
        </main>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <h1 className="text-2xl font-bold text-stone-950">Receptet saknas</h1>
            <p className="mt-2 text-stone-600">{error}</p>
            <Link
              href="/recept"
              className="mt-5 inline-flex rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
            >
              Till alla recept
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isFavorite = favoriteIds.includes(recipe._id);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <Link href="/recept" className="text-sm font-semibold text-emerald-700">
          Tillbaka till recept
        </Link>

        <section className="mt-5 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <img
              src={recipeImage(recipe)}
              alt={recipe.name}
              className="h-[420px] w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = "/images/heroImageLandingPage.jpg";
              }}
            />
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                {recipe.category || "Okategoriserat"}
              </span>
              {recipe.ownerName && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                  av {recipe.ownerName}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">
              {recipe.name}
            </h1>

            {recipe.description && (
              <p className="mt-4 text-lg leading-8 text-stone-700">
                {recipe.description}
              </p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <dt className="text-sm text-stone-500">Portioner</dt>
                <dd className="mt-1 text-xl font-bold text-stone-950">
                  {recipe.portions || "-"}
                </dd>
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <dt className="text-sm text-stone-500">Steg klara</dt>
                <dd className="mt-1 text-xl font-bold text-stone-950">
                  {completedSteps}/{recipe.instructions.length}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={toggleFavorite}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-6 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-emerald-700 hover:text-emerald-800"
            >
              {user ? (isFavorite ? "Sparad" : "Spara recept") : "Logga in för att spara"}
            </button>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-stone-950">Ingredienser</h2>
            <ul className="mt-5 grid gap-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={`${ingredient}-${index}`}
                  className="rounded-md bg-stone-50 px-4 py-3 text-stone-800"
                >
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-stone-950">Gör så här</h2>
            <div className="mt-5 grid gap-4">
              {recipe.instructions.length > 0 ? (
                recipe.instructions.map((instruction, index) => (
                  <label
                    key={`${instruction}-${index}`}
                    className={`flex gap-4 rounded-md border p-4 transition ${
                      checkedSteps[index]
                        ? "border-emerald-200 bg-emerald-50 text-stone-500"
                        : "border-stone-200 bg-white text-stone-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(checkedSteps[index])}
                      onChange={() => toggleStep(index)}
                      className="mt-1 h-5 w-5 accent-emerald-700"
                    />
                    <span>
                      <span className="mb-1 block text-sm font-semibold text-stone-500">
                        Steg {index + 1}
                      </span>
                      {instruction}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-stone-600">Inga steg är tillagda än.</p>
              )}
            </div>
          </div>
        </section>

        {recipe.source_image && (
          <p className="mt-6 text-sm text-stone-500">
            Bildkälla: {recipe.source_image}
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ReceptDetalj;
