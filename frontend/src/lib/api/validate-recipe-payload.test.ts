import { describe, expect, it } from "vitest";
import { normalizeRecipePayload } from "@/lib/supabase/recipes-map";
import {
  RECIPE_LIMITS,
  validateRecipePayload,
} from "./validate-recipe-payload";
import { parseRecipeId } from "./request-guards";

describe("validateRecipePayload", () => {
  it("requires name and ingredients", () => {
    expect(validateRecipePayload(normalizeRecipePayload({}))).toMatch(/krävs/i);
  });

  it("accepts a minimal valid recipe", () => {
    const payload = normalizeRecipePayload({
      name: "Pasta",
      ingredients: ["pasta", "tomat"],
    });
    expect(validateRecipePayload(payload)).toBeNull();
  });

  it("rejects very long names", () => {
    const payload = normalizeRecipePayload({
      name: "x".repeat(RECIPE_LIMITS.nameMax + 1),
      ingredients: ["salt"],
    });
    expect(validateRecipePayload(payload)).toMatch(/namn/i);
  });

  it("rejects too many ingredients", () => {
    const payload = normalizeRecipePayload({
      name: "Test",
      ingredients: Array.from({ length: RECIPE_LIMITS.maxIngredients + 1 }, (_, i) =>
        String(i)
      ),
    });
    expect(validateRecipePayload(payload)).toMatch(/ingredienser/i);
  });

  it("rejects oversized data-url images", () => {
    const payload = normalizeRecipePayload({
      name: "Test",
      ingredients: ["salt"],
      image: `data:image/jpeg;base64,${"a".repeat(RECIPE_LIMITS.maxDataImageLength + 1)}`,
    });
    expect(validateRecipePayload(payload)).toMatch(/bild/i);
  });
});

describe("parseRecipeId", () => {
  it("accepts uuid", () => {
    expect(parseRecipeId("b8c4e2f1-6a3d-4f5e-9c2b-1d8e7f6a5b4c")).toBe(
      "b8c4e2f1-6a3d-4f5e-9c2b-1d8e7f6a5b4c"
    );
  });

  it("rejects invalid ids", () => {
    expect(parseRecipeId("not-a-uuid")).toBeNull();
    expect(parseRecipeId("local-123")).toBeNull();
  });
});
