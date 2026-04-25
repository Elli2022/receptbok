import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Recipe, recipeImage } from "@/lib/recipes";
import {
  CurrentUser,
  getCurrentUser,
  loginRedirect,
} from "@/lib/authClient";
import { listSavedRecipes, setRecipeFavorite } from "@/lib/supabaseRecipes";

const SparadePage = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSavedRecipes = async () => {
      setIsLoading(true);
      setError("");

      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          setUser(null);
          setSavedRecipes([]);
          return;
        }

        setUser(currentUser);
        setSavedRecipes(await listSavedRecipes());
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Kunde inte hämta sparade recept."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedRecipes();
  }, []);

  const removeFavorite = async (recipeId: string) => {
    try {
      await setRecipeFavorite(recipeId, true);
      setSavedRecipes((current) => current.filter((recipe) => recipe._id !== recipeId));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Kunde inte ta bort receptet."
      );
    }
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
            Din personliga receptlista.
          </h1>
          <p className="mt-4 text-lg leading-8 text-stone-700">
            Här hamnar recept du har sparat från det allmänna biblioteket.
          </p>
        </section>

        {isLoading ? (
          <p className="mt-8 rounded-lg border border-stone-200 bg-white p-6 text-stone-700">
            Hämtar sparade recept...
          </p>
        ) : !user ? (
          <section className="mt-8 rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-stone-950">
              Logga in för att se sparade recept
            </h2>
            <p className="mt-2 text-stone-600">
              Dina sparade recept hör till ditt konto.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={loginRedirect("/sparade")}
                className="inline-flex rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
              >
                Logga in
              </Link>
              <Link
                href={`/register?next=${encodeURIComponent("/sparade")}`}
                className="inline-flex rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800"
              >
                Skapa konto
              </Link>
            </div>
          </section>
        ) : error ? (
          <section className="mt-8 rounded-lg border border-stone-200 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-stone-950">Något gick fel</h2>
            <p className="mt-2 text-stone-600">{error}</p>
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
                      {recipe.ownerName && <span>av {recipe.ownerName}</span>}
                    </div>
                    <h2 className="text-xl font-bold text-stone-950">{recipe.name}</h2>
                    {recipe.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
                        {recipe.description}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="border-t border-stone-100 px-5 py-3">
                  <button
                    type="button"
                    onClick={() => removeFavorite(recipe._id)}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-emerald-700 hover:text-emerald-800"
                  >
                    Ta bort från sparade
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
              Gå till biblioteket och spara recept du vill laga igen.
            </p>
            <Link
              href="/recept"
              className="mt-5 inline-flex rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
            >
              Visa biblioteket
            </Link>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SparadePage;
