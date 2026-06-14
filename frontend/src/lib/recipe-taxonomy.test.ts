import { describe, expect, it } from "vitest";
import { inferDietTags, inferMealType, recipeMatchesDiet, recipeMatchesMeal } from "./recipe-taxonomy";
import type { Recipe } from "./recipes";

const baseRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  _id: "test-id",
  name: "Testrecept",
  category: "Middag",
  ingredients: ["pasta", "tomat"],
  instructions: ["Koka"],
  ...overrides,
});

describe("inferMealType", () => {
  it("detects dessert from name", () => {
    expect(inferMealType("Bak", "Chokladkaka", "")).toBe("dessert");
  });

  it("detects middag from category keywords", () => {
    expect(inferMealType("Pasta, middag", "Spaghetti", "")).toBe("middag");
  });
});

describe("inferDietTags", () => {
  it("adds glutenfritt when gluten appears in haystack", () => {
    const tags = inferDietTags(
      baseRecipe({ name: "Glutenfri kladdkaka", category: "Dessert" })
    );
    expect(tags).toContain("glutenfritt");
  });

  it("adds snabbt for short prep time", () => {
    const tags = inferDietTags(baseRecipe({ prepTimeMinutes: 20 }));
    expect(tags).toContain("snabbt");
  });
});

describe("recipeMatchesDiet", () => {
  it("matches stored tags without inference", () => {
    const recipe = baseRecipe({ tags: ["glutenfritt"] });
    expect(recipeMatchesDiet(recipe, "glutenfritt")).toBe(true);
  });
});

describe("recipeMatchesMeal", () => {
  it("matches dessert filter via mealType", () => {
    const recipe = baseRecipe({
      mealType: "dessert",
      name: "Kaka",
      category: "Dessert",
      ingredients: ["ägg", "socker"],
    });
    expect(recipeMatchesMeal(recipe, "dessert")).toBe(true);
    expect(recipeMatchesMeal(recipe, "middag")).toBe(false);
  });
});
