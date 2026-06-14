export type RecipeRow = {
  id: string;
  owner_name?: string | null;
  name: string;
  description: string | null;
  portions: string | null;
  category: string | null;
  meal_type?: string | null;
  tags?: string[] | null;
  prep_time_minutes?: number | null;
  ingredients: string[] | null;
  instructions: string[] | null;
  image: string | null;
  source_image: string | null;
  created_at: string;
};

export function recipeRowToClient(row: RecipeRow) {
  return {
    _id: row.id,
    name: row.name,
    ownerName: row.owner_name?.trim() || undefined,
    description: row.description ?? "",
    portions: row.portions ?? undefined,
    category: row.category ?? "Okategoriserat",
    mealType: row.meal_type ?? undefined,
    tags: row.tags ?? [],
    prepTimeMinutes:
      row.prep_time_minutes != null ? Number(row.prep_time_minutes) : undefined,
    ingredients: row.ingredients ?? [],
    instructions: row.instructions ?? [],
    image: row.image ?? "",
    source_image: row.source_image ?? "",
    createdAt: row.created_at,
  };
}

/** Lightweight list row — omits instructions for smaller /api/recipes payloads. */
export function recipeRowToListClient(
  row: Omit<RecipeRow, "instructions"> & { instructions?: string[] | null }
) {
  return { ...recipeRowToClient({ ...row, instructions: [] } as RecipeRow), instructions: [] };
}

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const normalizeRecipePayload = (body: Record<string, unknown>) => ({
  name: String(body.name ?? "").trim(),
  description: body.description ? String(body.description).trim() : "",
  portions: body.portions ? String(body.portions).trim() : "",
  ingredients: toStringArray(body.ingredients),
  instructions: toStringArray(body.instructions),
  category: body.category ? String(body.category).trim() : "Okategoriserat",
  meal_type: body.meal_type
    ? String(body.meal_type).trim()
    : body.mealType
      ? String(body.mealType).trim()
      : "",
  tags: toStringArray(body.tags),
  prep_time_minutes:
    body.prep_time_minutes != null
      ? Number(body.prep_time_minutes)
      : body.prepTimeMinutes != null
        ? Number(body.prepTimeMinutes)
        : null,
  image: body.image ? String(body.image).trim() : "",
  source_image: body.source_image ? String(body.source_image).trim() : "",
});
