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

const LOCAL_RECIPES_KEY = "receptbok.localRecipes.v1";
const FAVORITES_KEY = "receptbok.favoriteRecipeIds.v1";

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

export const getLocalRecipes = (): Recipe[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedRecipes = window.localStorage.getItem(LOCAL_RECIPES_KEY);
    return storedRecipes
      ? JSON.parse(storedRecipes).map((recipe: unknown) =>
          normalizeRecipe({ ...(recipe as object), localOnly: true })
        )
      : [];
  } catch {
    return [];
  }
};

export const setLocalRecipes = (recipes: Recipe[]) => {
  window.localStorage.setItem(LOCAL_RECIPES_KEY, JSON.stringify(recipes));
};

export const saveLocalRecipe = (draft: RecipeDraft): Recipe => {
  const recipe = normalizeRecipe({
    _id: `local-${Date.now()}`,
    name: draft.name,
    category: draft.category,
    portions: Number(draft.portions) || draft.portions,
    description: draft.description,
    ingredients: draft.ingredients,
    instructions: draft.instructions,
    image: draft.imageDataUrl || draft.imageUrl,
    source_image: draft.imageDataUrl ? "Egen bild" : draft.imageUrl,
    createdAt: new Date().toISOString(),
    localOnly: true,
  });

  const recipes = [recipe, ...getLocalRecipes()];
  setLocalRecipes(recipes);

  return recipe;
};

export const getFavoriteRecipeIds = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const favorites = window.localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch {
    return [];
  }
};

export const setFavoriteRecipeIds = (recipeIds: string[]) => {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(recipeIds));
};

export const toggleFavoriteRecipe = (recipeId: string) => {
  const favorites = getFavoriteRecipeIds();
  const nextFavorites = favorites.includes(recipeId)
    ? favorites.filter((id) => id !== recipeId)
    : [recipeId, ...favorites];

  setFavoriteRecipeIds(nextFavorites);
  return nextFavorites;
};

export const mergeRecipes = (primary: Recipe[], secondary: Recipe[]) => {
  const seen = new Set<string>();

  return [...primary, ...secondary].filter((recipe) => {
    if (seen.has(recipe._id)) {
      return false;
    }

    seen.add(recipe._id);
    return true;
  });
};
