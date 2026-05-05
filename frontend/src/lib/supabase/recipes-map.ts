export type RecipeRow = {
  id: string;
  name: string;
  description: string | null;
  portions: string | null;
  category: string | null;
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
    description: row.description ?? "",
    portions: row.portions ?? undefined,
    category: row.category ?? "Okategoriserat",
    ingredients: row.ingredients ?? [],
    instructions: row.instructions ?? [],
    image: row.image ?? "",
    source_image: row.source_image ?? "",
    createdAt: row.created_at,
  };
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
  image: body.image ? String(body.image).trim() : "",
  source_image: body.source_image ? String(body.source_image).trim() : "",
});
