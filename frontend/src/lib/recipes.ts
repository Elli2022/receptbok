import { inferDietTags, inferMealType } from "@/lib/recipe-taxonomy";
import { EMBEDDED_RECIPE_IMAGE_BY_ID } from "@/lib/supabase/embedded-recipe-images";

export type Recipe = {
  _id: string;
  name: string;
  ownerName?: string;
  category?: string;
  mealType?: string;
  prepTimeMinutes?: number;
  tags?: string[];
  portions?: number | string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  image?: string;
  source_image?: string;
  createdAt?: string;
  localOnly?: boolean;
  originalRecipeId?: string | null;
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
  _id: String(recipe?._id ?? recipe?.id ?? `local-${Date.now()}`),
  name: String(recipe?.name ?? "Namnlöst recept"),
  ownerName: recipe?.ownerName
    ? String(recipe.ownerName)
    : recipe?.owner_name
      ? String(recipe.owner_name)
      : undefined,
  category: recipe?.category ? String(recipe.category) : "Okategoriserat",
  mealType: recipe?.mealType
    ? String(recipe.mealType)
    : recipe?.meal_type
      ? String(recipe.meal_type)
      : undefined,
  prepTimeMinutes:
    recipe?.prepTimeMinutes != null
      ? Number(recipe.prepTimeMinutes)
      : recipe?.prep_time_minutes != null
        ? Number(recipe.prep_time_minutes)
        : undefined,
  tags: Array.isArray(recipe?.tags) ? recipe.tags.map(String) : [],
  portions: recipe?.portions ?? "",
  description: recipe?.description ? String(recipe.description) : "",
  ingredients: splitList(recipe?.ingredients),
  instructions: splitList(recipe?.instructions),
  image: recipe?.image ? String(recipe.image) : "",
  source_image: recipe?.source_image ? String(recipe.source_image) : "",
  createdAt: recipe?.createdAt ? String(recipe.createdAt) : new Date().toISOString(),
  localOnly: Boolean(recipe?.localOnly),
  originalRecipeId: recipe?.originalRecipeId
    ? String(recipe.originalRecipeId)
    : null,
});

export const recipeImage = (recipe: Recipe) => {
  const image = recipe.image?.trim() ?? "";
  if (image) {
    return image;
  }
  const legacy = recipe._id ? EMBEDDED_RECIPE_IMAGE_BY_ID[recipe._id] : "";
  return legacy || "/images/heroImageLandingPage.jpg";
};

export const recipeMatchesSearch = (recipe: Recipe, searchTerm: string) => {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return true;
  }

  const haystack = [
    recipe.name,
    recipe.category,
    recipe.mealType,
    recipe.ownerName,
    recipe.description,
    recipe.ingredients.join(" "),
    recipe.instructions.join(" "),
    (recipe.tags ?? []).join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const words = query.split(/\s+/).filter(Boolean);
  return words.every((word) => haystack.includes(word));
};

export const enrichRecipe = (recipe: Recipe): Recipe => {
  const mealType =
    recipe.mealType ??
    inferMealType(recipe.category, recipe.name, recipe.description);
  const dbTags = (recipe.tags ?? []).map((tag) => tag.toLowerCase()).filter(Boolean);
  const tags =
    dbTags.length > 0
      ? dbTags
      : inferDietTags({ ...recipe, mealType });

  return { ...recipe, mealType, tags };
};

export const sortRecipes = (
  recipes: Recipe[],
  sort: "newest" | "name" | "time"
) => {
  const copy = [...recipes];
  if (sort === "name") {
    return copy.sort((a, b) => a.name.localeCompare(b.name, "sv"));
  }
  if (sort === "time") {
    return copy.sort(
      (a, b) => (a.prepTimeMinutes ?? 9999) - (b.prepTimeMinutes ?? 9999)
    );
  }
  return copy.sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
    return bTime - aTime;
  });
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
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("receptbok:local-recipes-change"));
  }
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

export const saveLocalRecipeCopy = (
  recipe: Recipe,
  options?: { ownerUserId?: string }
): Recipe => {
  const copy = normalizeRecipe({
    _id: `local-${Date.now()}`,
    name: recipe.name,
    category: recipe.category,
    portions: recipe.portions,
    description: recipe.description,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    image: recipe.image,
    source_image: recipe.source_image,
    createdAt: new Date().toISOString(),
    localOnly: true,
    originalRecipeId: recipe.originalRecipeId ?? recipe._id,
    ownerUserId: options?.ownerUserId,
  });

  const recipes = [copy, ...getLocalRecipes()];
  setLocalRecipes(recipes);
  return copy;
};

export const updateLocalRecipe = (
  recipeId: string,
  updates: Partial<Recipe>
): Recipe | null => {
  const recipes = getLocalRecipes();
  const index = recipes.findIndex((item) => item._id === recipeId);
  if (index < 0) {
    return null;
  }

  const updatedRecipe = normalizeRecipe({
    ...recipes[index],
    ...updates,
    localOnly: true,
  });

  recipes[index] = updatedRecipe;
  setLocalRecipes(recipes);
  return updatedRecipe;
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
