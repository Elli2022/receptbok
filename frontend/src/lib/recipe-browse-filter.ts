import type { Recipe } from "@/lib/recipes";
import { recipeMatchesSearch, sortRecipes } from "@/lib/recipes";
import {
  recipeMatchesDiet,
  recipeMatchesMeal,
  type DietTagId,
  type MealTypeId,
  type SortId,
} from "@/lib/recipe-taxonomy";

export type BrowseFilterState = {
  searchTerm: string;
  mealFilter: MealTypeId;
  dietFilter: DietTagId | null;
  sortBy: SortId;
};

export function filterRecipesForBrowse(
  recipes: Recipe[],
  { searchTerm, mealFilter, dietFilter, sortBy }: BrowseFilterState
): Recipe[] {
  const deferredSearch = searchTerm;
  const hasActiveSearch = deferredSearch.trim().length > 0;

  const list = recipes.filter((recipe) => {
    if (!recipeMatchesSearch(recipe, deferredSearch)) return false;
    if (hasActiveSearch) return true;
    if (!recipeMatchesMeal(recipe, mealFilter)) return false;
    return recipeMatchesDiet(recipe, dietFilter);
  });

  return sortRecipes(list, sortBy);
}

export function hasActiveBrowseFilters({
  searchTerm,
  mealFilter,
  dietFilter,
}: Pick<BrowseFilterState, "searchTerm" | "mealFilter" | "dietFilter">): boolean {
  return (
    searchTerm.trim().length > 0 || mealFilter !== "alla" || dietFilter !== null
  );
}
