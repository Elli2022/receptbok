import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RecipeDetailClient from "./RecipeDetailClient";
import {
  getRecipeBasicForServer,
  getRecipeMetadataForServer,
} from "@/lib/supabase/get-recipe-server";
import { listRecipesForServer } from "@/lib/supabase/list-recipes-server";

export const revalidate = 120;

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const recipes = await listRecipesForServer();
  return recipes.map((recipe) => ({ id: recipe._id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeMetadataForServer(id);

  if (!recipe) {
    return { title: "Recept hittades inte" };
  }

  const description =
    recipe.description?.slice(0, 160) || "Läs receptet i Receptbok.";

  return {
    title: recipe.name,
    description,
    openGraph: {
      title: recipe.name,
      description,
      type: "article",
      images: recipe.image ? [{ url: recipe.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.name,
      description,
      images: recipe.image ? [recipe.image] : undefined,
    },
  };
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const isLocalRecipe = id.startsWith("local-");
  const initialRecipe = isLocalRecipe ? null : await getRecipeBasicForServer(id);

  if (!isLocalRecipe && !initialRecipe) {
    notFound();
  }

  return <RecipeDetailClient initialRecipe={initialRecipe} />;
}
