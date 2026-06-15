import { buildRecipeJsonLd } from "@/lib/recipe-json-ld";
import type { Recipe } from "@/lib/recipes";

type RecipeJsonLdProps = {
  recipe: Recipe;
  recipeId: string;
};

export default function RecipeJsonLd({ recipe, recipeId }: RecipeJsonLdProps) {
  const jsonLd = buildRecipeJsonLd(recipe, recipeId);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
