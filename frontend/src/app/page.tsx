import ReceptClient from "./recept/ReceptClient";
import { getRecipesForBrowsePage } from "@/lib/supabase/recipes-for-page";

export const revalidate = 60;

/** Startsidan = samma vy som /recept (ingen separat hero-landning). */
export default async function Home() {
  const initialRecipes = await getRecipesForBrowsePage();
  return <ReceptClient key="home-browse" showCreateForm={false} initialRecipes={initialRecipes} />;
}
