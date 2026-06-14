import { stashRecipeDetail } from "@/lib/recipe-detail-cache";
import { preloadRecipeImageUrl } from "@/lib/recipe-image-preload";
import { recipeImage, type Recipe } from "@/lib/recipes";

export type PrefetchableRouter = {
  prefetch: (href: string) => void;
};

function runPrefetch(
  router: PrefetchableRouter | null | undefined,
  recipe: Recipe
) {
  stashRecipeDetail(recipe);
  router?.prefetch(`/recept/${recipe._id}`);
  preloadRecipeImageUrl(recipeImage(recipe), { width: 1200, quality: 75 });
}

const hoverTimers = new Map<string, ReturnType<typeof setTimeout>>();

/** Väntar kort vid hover — undvik API-storm när musen glider över rutnätet. */
export function prefetchRecipeDetailOnHover(
  router: PrefetchableRouter | null | undefined,
  recipe: Recipe
) {
  const id = recipe._id;
  const existing = hoverTimers.get(id);
  if (existing) {
    clearTimeout(existing);
  }

  hoverTimers.set(
    id,
    setTimeout(() => {
      hoverTimers.delete(id);
      runPrefetch(router, recipe);
    }, 150)
  );
}

/** Direkt vid klick — ingen extra API-fetch, listdata räcker för första paint. */
export function prefetchRecipeDetailOnClick(
  router: PrefetchableRouter | null | undefined,
  recipe: Recipe
) {
  const pending = hoverTimers.get(recipe._id);
  if (pending) {
    clearTimeout(pending);
    hoverTimers.delete(recipe._id);
  }
  runPrefetch(router, recipe);
}
