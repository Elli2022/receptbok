import type { MetadataRoute } from "next";
import { listRecipesForServer } from "@/lib/supabase/list-recipes-server";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://recipe-book-platform.netlify.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteUrl}/recept`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/sparade`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/login`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const recipes = await listRecipesForServer();
    const recipeRoutes: MetadataRoute.Sitemap = recipes.map((recipe) => ({
      url: `${siteUrl}/recept/${recipe._id}`,
      lastModified: recipe.createdAt ? new Date(recipe.createdAt) : lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
    return [...staticRoutes, ...recipeRoutes];
  } catch (error) {
    console.error("sitemap: could not list recipes", error);
    return staticRoutes;
  }
}
