"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import {
  Recipe,
  getLocalRecipes,
  mergeRecipes,
  normalizeRecipe,
  recipeImage,
} from "@/lib/recipes";

const Home = () => {
  const [remoteRecipes, setRemoteRecipes] = useState<Recipe[]>([]);
  const [localRecipes, setLocalRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setLocalRecipes(getLocalRecipes());

    const fetchRecipes = async () => {
      try {
        const response = await fetch("/api/recipes");
        const data = await response.json();
        setRemoteRecipes(Array.isArray(data) ? data.map(normalizeRecipe) : []);
      } catch {
        setRemoteRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const recipes = useMemo(
    () => mergeRecipes(localRecipes, remoteRecipes),
    [localRecipes, remoteRecipes]
  );

  const featuredRecipes = recipes.slice(0, 3);
  const categories = Array.from(
    new Set(recipes.map((recipe) => recipe.category).filter(Boolean))
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main>
        <section className="relative min-h-[calc(100vh-72px)] overflow-hidden">
          <img
            src="/images/heroImageLandingPage.jpg"
            alt="Hemlagad mat på bordet"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-stone-950/45" />
          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl flex-col justify-center px-4 py-16 text-white">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-200">
              Receptbok
            </p>
            <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
              Ett gemensamt receptbibliotek med dina egna sparade favoriter.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100">
              Alla kan söka bland recepten. Logga in för att lägga till egna
              recept och spara favoriter till ditt konto.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/recept#nytt-recept"
                className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Lägg till recept
              </Link>
              <Link
                href="/recept"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-stone-950 shadow-sm transition hover:bg-stone-100"
              >
                Utforska recept
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <p className="text-3xl font-bold text-stone-950">{recipes.length}</p>
              <p className="mt-1 text-sm text-stone-600">recept i samlingen</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <p className="text-3xl font-bold text-stone-950">
                {categories.length || 0}
              </p>
              <p className="mt-1 text-sm text-stone-600">kategorier</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <p className="text-3xl font-bold text-stone-950">PWA</p>
              <p className="mt-1 text-sm text-stone-600">byggd för mobilen</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Senast tillagt
              </p>
              <h2 className="mt-2 text-3xl font-bold text-stone-950">
                Recept att laga nu
              </h2>
            </div>
            <Link href="/recept" className="text-sm font-semibold text-emerald-700">
              Visa alla
            </Link>
          </div>

          {isLoading ? (
            <p className="rounded-lg border border-stone-200 bg-white p-6 text-stone-700">
              Laddar recept...
            </p>
          ) : featuredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {featuredRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  href={`/recept/${recipe._id}`}
                  className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <img
                    className="h-56 w-full object-cover"
                    src={recipeImage(recipe)}
                    alt={recipe.name}
                    onError={(event) => {
                      event.currentTarget.src = "/images/heroImageLandingPage.jpg";
                    }}
                  />
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      {recipe.category || "Okategoriserat"}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-stone-950">
                      {recipe.name}
                    </h3>
                    {recipe.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
                        {recipe.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
              <h3 className="text-xl font-bold text-stone-950">
                Din receptbok är redo
              </h3>
              <p className="mt-2 text-stone-600">
                Börja med att lägga till ditt första recept.
              </p>
              <Link
                href="/recept#nytt-recept"
                className="mt-5 inline-flex rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
              >
                Nytt recept
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
