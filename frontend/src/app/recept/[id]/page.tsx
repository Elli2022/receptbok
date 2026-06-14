import type { Metadata } from "next";
import RecipeDetailClient from "./RecipeDetailClient";
import { getRecipeMetadataForServer } from "@/lib/supabase/get-recipe-server";

type Props = {
  params: Promise<{ id: string }>;
};

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

export default function RecipeDetailPage() {
  return <RecipeDetailClient />;
}
