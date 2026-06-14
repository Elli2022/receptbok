import { describe, expect, it } from "vitest";
import { filterRecipesForBrowse, hasActiveBrowseFilters } from "./recipe-browse-filter";
import type { Recipe } from "./recipes";

const recipes: Recipe[] = [
  {
    _id: "1",
    name: "Glutenfri kladdkaka",
    category: "Dessert",
    mealType: "dessert",
    tags: ["glutenfritt"],
    ingredients: ["ägg"],
    instructions: ["Baka"],
  },
  {
    _id: "2",
    name: "Lasagne",
    category: "Middag",
    mealType: "middag",
    tags: ["vegetariskt"],
    ingredients: ["pasta"],
    instructions: ["Grädda"],
  },
];

describe("hasActiveBrowseFilters", () => {
  it("is false with default filters", () => {
    expect(
      hasActiveBrowseFilters({ searchTerm: "", mealFilter: "alla", dietFilter: null })
    ).toBe(false);
  });

  it("is true when diet filter is set", () => {
    expect(
      hasActiveBrowseFilters({
        searchTerm: "",
        mealFilter: "alla",
        dietFilter: "glutenfritt",
      })
    ).toBe(true);
  });
});

describe("filterRecipesForBrowse", () => {
  it("filters glutenfritt + dessert combo", () => {
    const result = filterRecipesForBrowse(recipes, {
      searchTerm: "",
      mealFilter: "dessert",
      dietFilter: "glutenfritt",
      sortBy: "name",
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toContain("kladdkaka");
  });

  it("returns empty when combo matches nothing", () => {
    const result = filterRecipesForBrowse(recipes, {
      searchTerm: "",
      mealFilter: "dessert",
      dietFilter: "veganskt",
      sortBy: "name",
    });
    expect(result).toHaveLength(0);
  });

  it("search ignores meal and diet filters", () => {
    const result = filterRecipesForBrowse(recipes, {
      searchTerm: "lasagne",
      mealFilter: "dessert",
      dietFilter: "glutenfritt",
      sortBy: "name",
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Lasagne");
  });
});
