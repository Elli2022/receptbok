import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  Recipe,
  getLocalRecipes,
  normalizeRecipe,
  recipeImage,
  updateLocalRecipe,
} from "@/lib/recipes";
import { getStoredUser } from "@/lib/auth/local-user";
import { useLoggedIn } from "@/lib/auth/use-logged-in";

const ReceptDetalj = () => {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteHint, setFavoriteHint] = useState("");
  const isLoggedIn = useLoggedIn();
  const [isFavorite, setIsFavorite] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    portions: "",
    description: "",
    ingredients: "",
    instructions: "",
  });

  useEffect(() => {
    if (!id || typeof id !== "string") {
      return;
    }

    const ac = new AbortController();

    const loadRecipe = async () => {
      setIsLoading(true);
      setError("");

      const localRecipe = getLocalRecipes().find((item) => item._id === id);
      if (localRecipe) {
        setRecipe(localRecipe);
        setCheckedSteps({});
        setIsLoading(false);
        return;
      }

      try {
        const basicRes = await fetch(`/api/recipes/${id}?fields=basic`, {
          credentials: "include",
          signal: ac.signal,
        });

        if (basicRes.ok) {
          setRecipe(normalizeRecipe(await basicRes.json()));
          setEditMode(false);
          setCheckedSteps({});

          try {
            const mediaRes = await fetch(`/api/recipes/${id}?fields=media`, {
              credentials: "include",
              signal: ac.signal,
            });
            if (mediaRes.ok) {
              const media = (await mediaRes.json()) as {
                image?: string;
                source_image?: string;
              };
              setRecipe((current) =>
                current && current._id === id
                  ? {
                      ...current,
                      image:
                        typeof media.image === "string" ? media.image : current.image,
                      source_image:
                        typeof media.source_image === "string"
                          ? media.source_image
                          : current.source_image,
                    }
                  : current
              );
            }
          } catch {
            // valfri bild — ignorera om avbruten eller nätverksfel
          }

          return;
        }

        if (basicRes.status === 404) {
          throw new Error("Receptet kunde inte hämtas.");
        }

        const fullRes = await fetch(`/api/recipes/${id}`, {
          credentials: "include",
          signal: ac.signal,
        });

        if (!fullRes.ok) {
          throw new Error("Receptet kunde inte hämtas.");
        }

        setRecipe(normalizeRecipe(await fullRes.json()));
        setEditMode(false);
        setCheckedSteps({});
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          return;
        }
        setError("Receptet kunde inte hittas.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadRecipe();
    return () => ac.abort();
  }, [id]);

  useEffect(() => {
    if (!isLoggedIn || !recipe?._id) {
      return;
    }
    (async () => {
      try {
        const response = await fetch("/api/favorites", { credentials: "include" });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const favoriteIds = Array.isArray(data.recipeIds) ? data.recipeIds : [];
        setIsFavorite(favoriteIds.includes(recipe._id));
      } catch {
        // Ignore
      }
    })();
  }, [isLoggedIn, recipe?._id]);

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

  const toggleFavorite = () => {
    if (!recipe) {
      return;
    }

    if (!isLoggedIn) {
      setFavoriteHint("Logga in för att spara recept som favorit.");
      return;
    }
    setFavoriteHint("");
    (async () => {
      try {
        if (isFavorite) {
          const response = await fetch(`/api/favorites/${recipe._id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!response.ok) {
            const body = await response.json().catch(() => null);
            setFavoriteHint(
              typeof body?.message === "string"
                ? body.message
                : "Kunde inte ta bort favoriten."
            );
            return;
          }
          setIsFavorite(false);
        } else {
          const response = await fetch("/api/favorites", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipeId: recipe._id }),
          });
          if (!response.ok) {
            const body = await response.json().catch(() => null);
            setFavoriteHint(
              typeof body?.message === "string"
                ? body.message
                : "Kunde inte spara favoriten. Logga in och försök igen."
            );
            return;
          }
          setIsFavorite(true);
        }
      } catch {
        setFavoriteHint("Kunde inte uppdatera favorit just nu.");
      }
    })();
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

  const beginEdit = () => {
    setEditForm({
      name: recipe.name,
      category: recipe.category ?? "",
      portions: String(recipe.portions ?? ""),
      description: recipe.description ?? "",
      ingredients: recipe.ingredients.join("\n"),
      instructions: recipe.instructions.join("\n"),
    });
    setEditMode(true);
  };

  const saveEdit = () => {
    if (!recipe.localOnly) {
      return;
    }
    const updated = updateLocalRecipe(recipe._id, {
      name: editForm.name,
      category: editForm.category,
      portions: editForm.portions,
      description: editForm.description,
      ingredients: editForm.ingredients
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
      instructions: editForm.instructions
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    });
    if (updated) {
      setRecipe(updated);
      setEditMode(false);
    }
  };

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
              {recipe.localOnly && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                  Sparat lokalt
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
              disabled={!isLoggedIn}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-6 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-emerald-700 hover:text-emerald-800"
            >
              {isFavorite ? "♥ Sparad" : "♡ Spara recept"}
            </button>
            {!isLoggedIn && (
              <p className="mt-2 text-sm text-stone-600">
                <Link href="/login" className="font-semibold text-emerald-700 underline">
                  Logga in
                </Link>{" "}
                för att spara favoriter.
              </p>
            )}
            {favoriteHint && <p className="mt-2 text-sm text-stone-600">{favoriteHint}</p>}
            {recipe.localOnly && (
              <div className="mt-4 flex gap-2">
                {!editMode ? (
                  <button
                    type="button"
                    onClick={beginEdit}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700"
                  >
                    Redigera min version
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Spara ändringar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700"
                    >
                      Avbryt
                    </button>
                  </>
                )}
              </div>
            )}
            {recipe.localOnly && recipe.originalRecipeId && (
              <p className="mt-3 text-sm text-stone-600">
                Baseras på originalreceptet:{" "}
                <Link
                  href={`/recept/${recipe.originalRecipeId}`}
                  className="font-semibold text-emerald-700 underline"
                >
                  visa original
                </Link>
              </p>
            )}
          </div>
        </section>

        {editMode && recipe.localOnly && (
          <section className="mt-8 rounded-lg border border-stone-200 bg-white p-6">
            <h2 className="text-xl font-bold text-stone-950">Redigera min version</h2>
            <div className="mt-4 grid gap-4">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-md border border-stone-300 px-3 py-2"
                placeholder="Namn"
              />
              <input
                value={editForm.category}
                onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                className="rounded-md border border-stone-300 px-3 py-2"
                placeholder="Kategori"
              />
              <input
                value={editForm.portions}
                onChange={(e) => setEditForm((f) => ({ ...f, portions: e.target.value }))}
                className="rounded-md border border-stone-300 px-3 py-2"
                placeholder="Portioner"
              />
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                className="rounded-md border border-stone-300 px-3 py-2"
                placeholder="Beskrivning"
                rows={3}
              />
              <textarea
                value={editForm.ingredients}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, ingredients: e.target.value }))
                }
                className="rounded-md border border-stone-300 px-3 py-2"
                placeholder="Ingredienser, en per rad"
                rows={6}
              />
              <textarea
                value={editForm.instructions}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, instructions: e.target.value }))
                }
                className="rounded-md border border-stone-300 px-3 py-2"
                placeholder="Instruktioner, en per rad"
                rows={6}
              />
            </div>
          </section>
        )}

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
