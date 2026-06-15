import type { normalizeRecipePayload } from "@/lib/supabase/recipes-map";

export const RECIPE_LIMITS = {
  nameMax: 200,
  descriptionMax: 5000,
  categoryMax: 100,
  portionsMax: 50,
  mealTypeMax: 40,
  maxIngredients: 80,
  maxInstructions: 80,
  maxItemLength: 500,
  maxTags: 20,
  maxTagLength: 40,
  maxImageUrlLength: 2_000,
  maxDataImageLength: 400_000,
  maxPrepTimeMinutes: 24 * 60,
} as const;

type RecipePayload = ReturnType<typeof normalizeRecipePayload>;

function tooLong(value: string, max: number, label: string): string | null {
  if (value.length > max) {
    return `${label} får vara högst ${max} tecken.`;
  }
  return null;
}

function validateList(
  items: string[],
  maxItems: number,
  maxItemLength: number,
  label: string
): string | null {
  if (items.length > maxItems) {
    return `Högst ${maxItems} ${label} tillåtna.`;
  }
  if (items.some((item) => item.length > maxItemLength)) {
    return `Varje ${label.slice(0, -1)} får vara högst ${maxItemLength} tecken.`;
  }
  return null;
}

function validateImage(image: string): string | null {
  if (!image) {
    return null;
  }
  if (image.startsWith("data:")) {
    return tooLong(image, RECIPE_LIMITS.maxDataImageLength, "Bilden");
  }
  return tooLong(image, RECIPE_LIMITS.maxImageUrlLength, "Bild-URL");
}

export function validateRecipePayload(payload: RecipePayload): string | null {
  if (!payload.name) {
    return "Namn och minst en ingrediens krävs.";
  }
  if (payload.ingredients.length === 0) {
    return "Namn och minst en ingrediens krävs.";
  }

  return (
    tooLong(payload.name, RECIPE_LIMITS.nameMax, "Namnet") ??
    tooLong(payload.description, RECIPE_LIMITS.descriptionMax, "Beskrivningen") ??
    tooLong(payload.category, RECIPE_LIMITS.categoryMax, "Kategorin") ??
    tooLong(payload.portions, RECIPE_LIMITS.portionsMax, "Portioner") ??
    tooLong(payload.meal_type, RECIPE_LIMITS.mealTypeMax, "Måltidstyp") ??
    validateList(
      payload.ingredients,
      RECIPE_LIMITS.maxIngredients,
      RECIPE_LIMITS.maxItemLength,
      "ingredienser"
    ) ??
    validateList(
      payload.instructions,
      RECIPE_LIMITS.maxInstructions,
      RECIPE_LIMITS.maxItemLength,
      "instruktioner"
    ) ??
    (payload.tags.length > RECIPE_LIMITS.maxTags
      ? `Högst ${RECIPE_LIMITS.maxTags} taggar tillåtna.`
      : payload.tags.some((tag) => tag.length > RECIPE_LIMITS.maxTagLength)
        ? `Varje tagg får vara högst ${RECIPE_LIMITS.maxTagLength} tecken.`
        : null) ??
    validateImage(payload.image) ??
    tooLong(payload.source_image, RECIPE_LIMITS.maxImageUrlLength, "Bildkälla") ??
    (payload.prep_time_minutes != null &&
    (Number.isNaN(payload.prep_time_minutes) ||
      payload.prep_time_minutes < 0 ||
      payload.prep_time_minutes > RECIPE_LIMITS.maxPrepTimeMinutes)
      ? "Ogiltig tillagningstid."
      : null)
  );
}
