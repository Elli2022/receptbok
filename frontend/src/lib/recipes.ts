export type Recipe = {
  _id: string;
  name: string;
  category?: string;
  portions?: number | string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  image?: string;
  source_image?: string;
  ownerId?: string;
  ownerName?: string;
  createdAt?: string;
  localOnly?: boolean;
};

export type RecipeDraft = {
  name: string;
  category: string;
  portions: string;
  description: string;
  ingredients: string;
  instructions: string;
  imageUrl: string;
  imageDataUrl?: string;
};

const splitList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const normalizeRecipe = (recipe: any): Recipe => ({
  _id: String(recipe?._id ?? `local-${Date.now()}`),
  name: String(recipe?.name ?? "Namnlöst recept"),
  category: recipe?.category ? String(recipe.category) : "Okategoriserat",
  portions: recipe?.portions ?? "",
  description: recipe?.description ? String(recipe.description) : "",
  ingredients: splitList(recipe?.ingredients),
  instructions: splitList(recipe?.instructions),
  image: recipe?.image ? String(recipe.image) : "",
  source_image: recipe?.source_image ? String(recipe.source_image) : "",
  ownerId: recipe?.ownerId ? String(recipe.ownerId) : "",
  ownerName: recipe?.ownerName ? String(recipe.ownerName) : "",
  createdAt: recipe?.createdAt ? String(recipe.createdAt) : new Date().toISOString(),
  localOnly: Boolean(recipe?.localOnly),
});

export const recipeImage = (recipe: Recipe) =>
  recipe.image && recipe.image.trim().length > 0
    ? recipe.image
    : "/images/heroImageLandingPage.jpg";

export const recipeMatchesSearch = (recipe: Recipe, searchTerm: string) => {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [
    recipe.name,
    recipe.category,
    recipe.description,
    recipe.ingredients.join(" "),
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
};
