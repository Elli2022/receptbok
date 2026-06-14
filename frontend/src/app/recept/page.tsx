import type { Metadata } from "next";
import ReceptClient from "./ReceptClient";
import { mealFromQuery, type MealTypeId } from "@/lib/recipe-taxonomy";
import { getRecipesForBrowsePage } from "@/lib/supabase/recipes-for-page";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Recept",
  description: "Sök, filtrera och spara favoritrecept i din receptsamling.",
};

type PageProps = {
  searchParams: Promise<{ search?: string; meal?: string }>;
};

export default async function ReceptPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialSearch = typeof params.search === "string" ? params.search : "";
  const initialMeal: MealTypeId = initialSearch.trim()
    ? "alla"
    : mealFromQuery(params.meal);

  const initialRecipes = await getRecipesForBrowsePage();

  return (
    <ReceptClient
      key={`${initialSearch}-${initialMeal}`}
      initialSearch={initialSearch}
      initialMeal={initialMeal}
      initialRecipes={initialRecipes}
    />
  );
}
