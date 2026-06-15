import type { Recipe } from "@/lib/recipes";
import { absoluteAssetUrl, getSiteUrl } from "@/lib/site-url";

export function buildRecipeJsonLd(recipe: Recipe, recipeId: string) {
  const pageUrl = `${getSiteUrl()}/recept/${recipeId}`;
  const image = absoluteAssetUrl(recipe.image);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    url: pageUrl,
  };

  if (recipe.description) {
    data.description = recipe.description;
  }
  if (image && !image.startsWith("data:")) {
    data.image = [image];
  }
  if (recipe.ingredients.length > 0) {
    data.recipeIngredient = recipe.ingredients;
  }
  if (recipe.instructions.length > 0) {
    data.recipeInstructions = recipe.instructions.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text,
    }));
  }
  if (recipe.prepTimeMinutes && recipe.prepTimeMinutes > 0) {
    data.totalTime = `PT${recipe.prepTimeMinutes}M`;
  }
  if (recipe.portions) {
    data.recipeYield = String(recipe.portions);
  }

  return data;
}
