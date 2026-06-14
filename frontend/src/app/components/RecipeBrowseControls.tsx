"use client";

import type { ReactNode } from "react";
import {
  DIET_TAGS,
  MEAL_TYPES,
  SORT_OPTIONS,
  type DietTagId,
  type MealTypeId,
  type SortId,
} from "@/lib/recipe-taxonomy";

type RecipeBrowseControlsProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  mealFilter: MealTypeId;
  onMealFilterChange: (value: MealTypeId) => void;
  dietFilter: DietTagId | null;
  onDietFilterChange: (value: DietTagId) => void;
  sortBy?: SortId;
  onSortChange?: (value: SortId) => void;
  searchId?: string;
  showSort?: boolean;
  action?: ReactNode;
  onResetFilters?: () => void;
  showReset?: boolean;
};

const mealChipClass = (active: boolean) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    active
      ? "bg-rose-700 text-white shadow-sm"
      : "border border-stone-300 bg-white text-stone-700 hover:border-rose-300"
  }`;

const dietChipClass = (active: boolean) =>
  `rounded-full border px-4 py-2 text-sm font-medium transition ${
    active
      ? "border-rose-700 bg-rose-50 text-rose-800"
      : "border-stone-200 bg-white text-stone-600"
  }`;

const RecipeBrowseControls = ({
  searchTerm,
  onSearchChange,
  mealFilter,
  onMealFilterChange,
  dietFilter,
  onDietFilterChange,
  sortBy = "newest",
  onSortChange,
  searchId = "recipe-search",
  showSort = false,
  action,
  onResetFilters,
  showReset = false,
}: RecipeBrowseControlsProps) => {
  const hasToolbarExtras = showSort || action;

  return (
    <>
      <div
        className={
          hasToolbarExtras
            ? "grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
            : "flex flex-col gap-3 sm:flex-row sm:items-center"
        }
      >
        <label className="sr-only" htmlFor={searchId}>
          Sök recept
        </label>
        <input
          id={searchId}
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Sök recept, ingrediens eller kategori…"
          className="h-12 w-full flex-1 rounded-full border border-stone-300 bg-stone-50 px-5 text-stone-950 outline-none focus:border-rose-600 focus:ring-4 focus:ring-rose-100"
        />
        {showSort && onSortChange && (
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as SortId)}
            className="h-12 rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-800"
            aria-label="Sortering"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        {action}
      </div>

      <section className="mt-4 flex flex-wrap gap-2">
        {MEAL_TYPES.map((meal) => (
          <button
            key={meal.id}
            type="button"
            onClick={() => onMealFilterChange(meal.id)}
            className={mealChipClass(mealFilter === meal.id)}
          >
            {meal.label}
          </button>
        ))}
      </section>

      <section className="mt-2 flex flex-wrap items-center gap-2">
        {DIET_TAGS.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onDietFilterChange(tag.id)}
            className={dietChipClass(dietFilter === tag.id)}
          >
            {tag.label}
          </button>
        ))}
        {showReset && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-rose-300 hover:text-rose-800"
          >
            Rensa filter
          </button>
        )}
      </section>
    </>
  );
};

export default RecipeBrowseControls;
