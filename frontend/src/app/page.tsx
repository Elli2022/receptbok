import ReceptClient from "./recept/ReceptClient";
import type { Metadata } from "next";
import { getRecipesForBrowsePage } from "@/lib/supabase/recipes-for-page";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Receptbok",
  description:
    "Sök, filtrera och spara favoritrecept i din personliga receptbok — gluten- och nötfritt.",
};

/** Startsidan = samma vy som /recept (ingen separat hero-landning). */
export default async function Home() {
  const initialRecipes = await getRecipesForBrowsePage();
  return <ReceptClient key="home-browse" showCreateForm={false} initialRecipes={initialRecipes} />;
}
