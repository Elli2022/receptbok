import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  Recipe,
  RecipeDraft,
  getLocalRecipes,
  mergeRecipes,
  normalizeRecipe,
  recipeImage,
  recipeMatchesSearch,
  saveLocalRecipe,
  saveLocalRecipeCopy,
} from "@/lib/recipes";
import { getStoredUser } from "@/lib/auth/local-user";
import { useLoggedIn } from "@/lib/auth/use-logged-in";

type Props = {
  recipes: Recipe[];
};

const emptyDraft: RecipeDraft = {
  name: "",
  category: "",
  portions: "4",
  description: "",
  ingredients: "",
  instructions: "",
  imageUrl: "",
  imageDataUrl: "",
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

const ReceptPage = ({ recipes }: Props) => {
  const router = useRouter();
  const [remoteRecipes, setRemoteRecipes] = useState<Recipe[]>(recipes);
  /** Tom vid SSR/hydration — annars mismatch mot localStorage. */
  const [localRecipes, setLocalRecipesState] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alla");
  const [draft, setDraft] = useState<RecipeDraft>(emptyDraft);
  const [formStatus, setFormStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isLoggedIn = useLoggedIn();
  const [heartLoadingId, setHeartLoadingId] = useState<string | null>(null);

  const prefetchRecipeDetail = (recipeId: string) => {
    router.prefetch(`/recept/${recipeId}`);
    void fetch(`/api/recipes/${recipeId}?fields=basic`, {
      credentials: "include",
    });
  };

  useEffect(() => {
    setLocalRecipesState(getLocalRecipes());
  }, []);

  useEffect(() => {
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
        // Ignore; favorites can be fetched lazily after interaction.
      }
    })();
  }, [isLoggedIn]);

  const allRecipes = useMemo(
    () => mergeRecipes(localRecipes, remoteRecipes),
    [localRecipes, remoteRecipes]
  );

  const categories = useMemo(() => {
    const recipeCategories = allRecipes
      .map((recipe) => recipe.category?.trim())
      .filter((category): category is string => Boolean(category));

    return ["Alla", ...Array.from(new Set(recipeCategories)).slice(0, 8)];
  }, [allRecipes]);

  const filteredRecipes = useMemo(
    () =>
      allRecipes.filter((recipe) => {
        const matchesCategory =
          selectedCategory === "Alla" || recipe.category === selectedCategory;
        return matchesCategory && recipeMatchesSearch(recipe, searchTerm);
      }),
    [allRecipes, searchTerm, selectedCategory]
  );

  const onDraftChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const onImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setDraft((current) => ({ ...current, imageDataUrl: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        imageDataUrl: typeof reader.result === "string" ? reader.result : "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const resetDraft = () => {
    setDraft(emptyDraft);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("");
    setIsSaving(true);

    const recipePayload = normalizeRecipe({
      ...draft,
      ingredients: draft.ingredients,
      instructions: draft.instructions,
      image: draft.imageDataUrl || draft.imageUrl,
      source_image: draft.imageDataUrl ? "Egen bild" : draft.imageUrl,
    });

    if (!recipePayload.name.trim() || recipePayload.ingredients.length === 0) {
      setFormStatus("Fyll i namn och minst en ingrediens.");
      setIsSaving(false);
      return;
    }

    try {
      if (!isLoggedIn) {
        setFormStatus("Logga in för att skapa recept i ditt konto.");
        setIsSaving(false);
        return;
      }

      if (!draft.imageDataUrl) {
        const response = await fetch("/api/recipes", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recipePayload),
        });

        if (response.ok) {
          const savedRecipe = normalizeRecipe(await response.json());
          setRemoteRecipes((current) => [savedRecipe, ...current]);
          setFormStatus("Receptet sparades.");
          resetDraft();
          return;
        }
      }

      const localRecipe = saveLocalRecipe(draft);
      setLocalRecipesState((current) => [localRecipe, ...current]);
      setFormStatus("Receptet sparades på den här enheten.");
      resetDraft();
    } catch {
      const localRecipe = saveLocalRecipe(draft);
      setLocalRecipesState((current) => [localRecipe, ...current]);
      setFormStatus("Receptet sparades på den här enheten.");
      resetDraft();
    } finally {
      setIsSaving(false);
    }
  };

  const onToggleFavorite = (recipeId: string) => {
    if (!isLoggedIn) {
      setFormStatus("Logga in för att spara favoriter.");
      return;
    }
    const isAlreadyFavorite = favoriteIds.includes(recipeId);
    setHeartLoadingId(recipeId);

    (async () => {
      try {
        if (isAlreadyFavorite) {
          const response = await fetch(`/api/favorites/${recipeId}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!response.ok) {
            const body = await response.json().catch(() => null);
            setFormStatus(
              typeof body?.message === "string"
                ? body.message
                : "Kunde inte ta bort favoriten."
            );
            return;
          }
          setFavoriteIds((current) => current.filter((id) => id !== recipeId));
        } else {
          const response = await fetch("/api/favorites", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipeId }),
          });
          if (!response.ok) {
            const body = await response.json().catch(() => null);
            setFormStatus(
              typeof body?.message === "string"
                ? body.message
                : "Kunde inte spara favoriten. Är du inloggad?"
            );
            return;
          }
          setFavoriteIds((current) =>
            current.includes(recipeId) ? current : [recipeId, ...current]
          );
        }
      } catch {
        setFormStatus("Kunde inte uppdatera favorit just nu.");
      } finally {
        setHeartLoadingId(null);
      }
    })();
  };

  const onCreateMyVersion = (recipe: Recipe) => {
    if (!isLoggedIn) {
      setFormStatus("Logga in för att skapa en egen version.");
      return;
    }
    const localCopy = saveLocalRecipeCopy(recipe, {
      ownerUserId: getStoredUser()?.id,
    });
    window.location.href = `/recept/${localCopy._id}`;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Din receptsamling
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">
              Spara, hitta och laga recepten du faktiskt vill komma tillbaka till.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
              Bygg upp en egen receptbok direkt i webben, med snabb sökning,
              tydliga steg och sparade favoriter på mobilen.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <img
              src="/images/heroImageLandingPage.jpg"
              alt="Mat på ett dukat bord"
              className="h-80 w-full object-cover"
            />
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="sr-only">Sok recept</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Sök på recept, ingrediens eller kategori"
              className="h-12 w-full rounded-full border border-stone-300 bg-white px-5 text-stone-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          {isLoggedIn ? (
            <Link
              href="#nytt-recept"
              className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              Lägg till recept
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full bg-stone-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-700"
            >
              Logga in för att lägga till
            </Link>
          )}
        </section>

        <section className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
              }`}
            >
              {category}
            </button>
          ))}
        </section>

        <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <article
              key={recipe._id}
              className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              onMouseEnter={() => prefetchRecipeDetail(recipe._id)}
              onFocusCapture={() => prefetchRecipeDetail(recipe._id)}
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
                  <p className="mt-4 text-sm text-stone-500">
                    {recipe.ingredients.length} ingredienser
                    {recipe.portions ? ` · ${recipe.portions} portioner` : ""}
                  </p>
                </div>
              </Link>
              <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(recipe._id)}
                  disabled={heartLoadingId === recipe._id}
                  aria-label={
                    favoriteIds.includes(recipe._id)
                      ? "Ta bort från sparade"
                      : "Spara recept"
                  }
                  className={`text-2xl leading-none transition ${
                    favoriteIds.includes(recipe._id)
                      ? "text-rose-600"
                      : "text-stone-400 hover:text-rose-500"
                  } disabled:opacity-50`}
                >
                  {favoriteIds.includes(recipe._id) ? "♥" : "♡"}
                </button>
                {favoriteIds.includes(recipe._id) && (
                  <button
                    type="button"
                    onClick={() => onCreateMyVersion(recipe)}
                    className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:border-emerald-700 hover:text-emerald-800"
                  >
                    Egen version
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>

        {filteredRecipes.length === 0 && (
          <section className="mt-8 rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-stone-950">Inga recept hittades</h2>
            <p className="mt-2 text-stone-600">
              Testa en annan sökning eller lägg till ett nytt recept.
            </p>
          </section>
        )}

        <section
          id="nytt-recept"
          className="mt-14 rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Nytt recept
            </p>
            <h2 className="mt-2 text-3xl font-bold text-stone-950">
              Lägg till ett recept
            </h2>
          </div>

          {!isLoggedIn && (
            <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Du behöver vara inloggad för att skapa recept i Supabase.
              <Link href="/login" className="ml-2 font-semibold underline">
                Logga in
              </Link>
            </div>
          )}

          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Namn
                <input
                  name="name"
                  value={draft.name}
                  onChange={onDraftChange}
                  className="rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                  required
                  disabled={!isLoggedIn}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Kategori
                <input
                  name="category"
                  value={draft.category}
                  onChange={onDraftChange}
                  className="rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Pasta, middag, dessert"
                  disabled={!isLoggedIn}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-[160px_1fr]">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Portioner
                <input
                  name="portions"
                  type="number"
                  min="1"
                  value={draft.portions}
                  onChange={onDraftChange}
                  className="rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                  disabled={!isLoggedIn}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Kort beskrivning
                <input
                  name="description"
                  value={draft.description}
                  onChange={onDraftChange}
                  className="rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                  disabled={!isLoggedIn}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Ingredienser
                <textarea
                  name="ingredients"
                  value={draft.ingredients}
                  onChange={onDraftChange}
                  rows={7}
                  className="rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                  placeholder={"400 g pasta\n2 dl grädde\n1 citron"}
                  required
                  disabled={!isLoggedIn}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Steg
                <textarea
                  name="instructions"
                  value={draft.instructions}
                  onChange={onDraftChange}
                  rows={7}
                  className="rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                  placeholder={"Koka pastan.\nRör ihop såsen.\nServera direkt."}
                  disabled={!isLoggedIn}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Bildlank
                <input
                  name="imageUrl"
                  type="url"
                  value={draft.imageUrl}
                  onChange={onDraftChange}
                  className="rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                  placeholder="https://..."
                  disabled={!isLoggedIn}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Bild fran mobilen
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-stone-950 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  disabled={!isLoggedIn}
                />
              </label>
            </div>

            {draft.imageDataUrl && (
              <img
                src={draft.imageDataUrl}
                alt="Förhandsvisning"
                className="h-44 w-full rounded-md object-cover sm:w-80"
              />
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={isSaving || !isLoggedIn}
                className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Sparar..." : "Spara recept"}
              </button>
              {formStatus && (
                <p className="text-sm font-medium text-stone-700">{formStatus}</p>
              )}
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ReceptPage;
