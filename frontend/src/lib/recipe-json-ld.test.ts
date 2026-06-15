import { describe, expect, it } from "vitest";
import { buildRecipeJsonLd } from "./recipe-json-ld";
import type { Recipe } from "./recipes";

const baseRecipe: Recipe = {
  _id: "b8c4e2f1-6a3d-4f5e-9c2b-1d8e7f6a5b4c",
  name: "Pasta",
  ingredients: ["pasta", "tomat"],
  instructions: ["Koka pasta", "Blanda med sås"],
  description: "Enkel pastarätt",
  prepTimeMinutes: 20,
  portions: 4,
  image: "/images/heroImageLandingPage.jpg",
};

describe("buildRecipeJsonLd", () => {
  it("builds schema.org Recipe JSON-LD", () => {
    const jsonLd = buildRecipeJsonLd(baseRecipe, baseRecipe._id);

    expect(jsonLd["@type"]).toBe("Recipe");
    expect(jsonLd.name).toBe("Pasta");
    expect(jsonLd.recipeIngredient).toEqual(["pasta", "tomat"]);
    expect(jsonLd.recipeInstructions).toHaveLength(2);
    expect(jsonLd.totalTime).toBe("PT20M");
    expect(jsonLd.recipeYield).toBe("4");
    expect(jsonLd.url).toContain(`/recept/${baseRecipe._id}`);
    expect(jsonLd.image).toEqual([
      expect.stringContaining("/images/heroImageLandingPage.jpg"),
    ]);
  });

  it("omits data-url images from structured data", () => {
    const jsonLd = buildRecipeJsonLd(
      { ...baseRecipe, image: "data:image/jpeg;base64,abc" },
      baseRecipe._id
    );

    expect(jsonLd.image).toBeUndefined();
  });
});
