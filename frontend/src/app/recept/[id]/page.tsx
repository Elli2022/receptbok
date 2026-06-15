import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RecipeDetailClient from "./RecipeDetailClient";
import RecipeJsonLd from "@/app/components/RecipeJsonLd";
import { absoluteAssetUrl, getSiteUrl } from "@/lib/site-url";
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
  const pageUrl = `${getSiteUrl()}/recept/${id}`;
  const imageUrl = absoluteAssetUrl(recipe.image);

  return {
    title: recipe.name,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: recipe.name,
      description,
      type: "article",
      url: pageUrl,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.name,
      description,
      images: imageUrl ? [imageUrl] : undefined,
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

  return (
    <>
      {initialRecipe ? (
        <RecipeJsonLd recipe={initialRecipe} recipeId={id} />
      ) : null}
      <RecipeDetailClient initialRecipe={initialRecipe} />
    </>
  );
}
