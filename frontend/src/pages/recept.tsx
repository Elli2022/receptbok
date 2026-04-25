import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  Recipe,
  RecipeDraft,
  normalizeRecipe,
  recipeImage,
  recipeMatchesSearch,
} from "@/lib/recipes";
import {
  CurrentUser,
  getCurrentUser,
  loginRedirect,
} from "@/lib/authClient";
import {
  createRecipe,
  listRecipes,
  setRecipeFavorite,
} from "@/lib/supabaseRecipes";

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

const ReceptPage = () => {
  const router = useRouter();
  const [remoteRecipes, setRemoteRecipes] = useState<Recipe[]>([]);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alla");
  const [draft, setDraft] = useState<RecipeDraft>(emptyDraft);
  const [formStatus, setFormStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState("");

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

    listRecipes().then(setRemoteRecipes).catch(() => setRemoteRecipes([]));
  }, []);

  const allRecipes = remoteRecipes;

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

    if (!user) {
      router.push(loginRedirect("/recept#nytt-recept"));
      return;
    }

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
      const savedRecipe = await createRecipe(recipePayload);
      setRemoteRecipes((current) => [savedRecipe, ...current]);
      setFormStatus("Receptet är publicerat i biblioteket.");
      resetDraft();
    } catch (error) {
      setFormStatus(
        error instanceof Error ? error.message : "Receptet kunde inte sparas."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onToggleFavorite = async (recipeId: string) => {
    setFavoriteStatus("");

    if (!user) {
      router.push(loginRedirect("/recept"));
      return;
    }

    const isSaved = favoriteIds.includes(recipeId);
    try {
      setFavoriteIds(await setRecipeFavorite(recipeId, isSaved));
    } catch (error) {
      setFavoriteStatus(
        error instanceof Error
          ? error.message
          : "Kunde inte uppdatera sparade recept."
      );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Allmänt bibliotek
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">
              Sök bland allas recept och spara dina egna favoriter.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
              Alla kan läsa biblioteket. Logga in för att lägga till egna recept
              och spara andras recept till din personliga lista.
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
          <Link
            href="#nytt-recept"
            className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Lägg till recept
          </Link>
        </section>

        {favoriteStatus && (
          <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {favoriteStatus}
          </p>
        )}

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
            >
              <Link
                href={`/recept-detalj?id=${encodeURIComponent(recipe._id)}`}
                className="block"
              >
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
                    {recipe.ownerName && <span>av {recipe.ownerName}</span>}
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
              <div className="border-t border-stone-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(recipe._id)}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-emerald-700 hover:text-emerald-800"
                >
                  {user
                    ? favoriteIds.includes(recipe._id)
                      ? "Sparad"
                      : "Spara"
                    : "Logga in för att spara"}
                </button>
              </div>
            </article>
          ))}
        </section>

        {filteredRecipes.length === 0 && (
          <section className="mt-8 rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-stone-950">Inga recept hittades</h2>
            <p className="mt-2 text-stone-600">
              Testa en annan sökning eller logga in och lägg till ett nytt recept.
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

          {!user ? (
            <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-6">
              <h3 className="text-xl font-bold text-stone-950">
                Logga in för att lägga till recept
              </h3>
              <p className="mt-2 text-stone-600">
                Biblioteket är öppet för alla att läsa, men nya recept kopplas
                till ditt konto.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={loginRedirect("/recept#nytt-recept")}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-semibold text-white"
                >
                  Logga in
                </Link>
                <Link
                  href={`/register?next=${encodeURIComponent("/recept#nytt-recept")}`}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-stone-300 px-6 text-sm font-semibold text-stone-800"
                >
                  Skapa konto
                </Link>
              </div>
            </div>
          ) : (
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
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Kort beskrivning
                <input
                  name="description"
                  value={draft.description}
                  onChange={onDraftChange}
                  className="rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
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
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Bildlänk
                <input
                  name="imageUrl"
                  type="url"
                  value={draft.imageUrl}
                  onChange={onDraftChange}
                  className="rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                  placeholder="https://..."
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Bild från mobilen
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-stone-950 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
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
                disabled={isSaving}
                className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Sparar..." : "Spara recept"}
              </button>
              {formStatus && (
                <p className="text-sm font-medium text-stone-700">{formStatus}</p>
              )}
            </div>
          </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ReceptPage;
