"use client";

import Link from "next/link";
import RecipeImage from "@/app/components/RecipeImage";
import { Recipe, recipeImage } from "@/lib/recipes";
import { formatPrepTime, mealTypeLabel } from "@/lib/recipe-taxonomy";

type RecipeCardProps = {
  recipe: Recipe;
  href: string;
  onPrefetch?: () => void;
  onNavigate?: () => void;
  footer?: React.ReactNode;
};

const RecipeCard = ({ recipe, href, onPrefetch, onNavigate, footer }: RecipeCardProps) => {
  const timeLabel = formatPrepTime(recipe.prepTimeMinutes);
  const mealLabel = mealTypeLabel(recipe.mealType);

  return (
    <article
      className="recipe-card group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
      onMouseEnter={onPrefetch}
      onFocusCapture={onPrefetch}
    >
      <Link
        href={href}
        prefetch={false}
        className="flex flex-1 flex-col"
        onClick={() => onNavigate?.()}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <RecipeImage
            src={recipeImage(recipe)}
            alt={recipe.name}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/75 to-transparent p-4 pt-12">
            <div className="flex flex-wrap gap-2">
              {mealLabel && (
                <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-stone-800">
                  {mealLabel}
                </span>
              )}
              {timeLabel && (
                <span className="rounded-full bg-amber-400/95 px-2.5 py-0.5 text-xs font-semibold text-stone-900">
                  {timeLabel}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
            {recipe.category || "Okategoriserat"}
          </p>
          <h2 className="mt-2 line-clamp-2 text-xl font-bold leading-snug text-stone-950 group-hover:text-rose-800">
            {recipe.name}
          </h2>
          {recipe.ownerName && (
            <p className="mt-1 text-xs font-medium text-stone-500">
              Tipsat av {recipe.ownerName}
            </p>
          )}
          <p className="mt-2 line-clamp-2 min-h-[3rem] text-sm leading-6 text-stone-600">
            {recipe.description || "\u00A0"}
          </p>
          <p className="mt-auto pt-4 text-sm text-stone-500">
            {recipe.ingredients.length} ingredienser
            {recipe.portions ? ` · ${recipe.portions} portioner` : ""}
          </p>
        </div>
      </Link>
      <div className="min-h-[3.25rem] border-t border-stone-100 px-5 py-3">
        {footer ?? <span className="sr-only">Inga åtgärder</span>}
      </div>
    </article>
  );
};

export default RecipeCard;
