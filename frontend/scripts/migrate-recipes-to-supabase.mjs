#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing env: ${key}`);
    process.exit(1);
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const toStringArray = (value) => {
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

const normalizeRecipe = (recipe) => ({
  name: String(recipe?.name ?? "").trim(),
  description: recipe?.description ? String(recipe.description).trim() : "",
  portions: recipe?.portions ? String(recipe.portions).trim() : "",
  category: recipe?.category ? String(recipe.category).trim() : "Okategoriserat",
  ingredients: toStringArray(recipe?.ingredients),
  instructions: toStringArray(recipe?.instructions),
  image: recipe?.image ? String(recipe.image).trim() : "",
  source_image: recipe?.source_image ? String(recipe.source_image).trim() : "",
  created_at: recipe?.createdAt ? String(recipe.createdAt) : new Date().toISOString(),
  owner_name: "Migrerad data",
});

const legacyRecipesUrl =
  process.env.LEGACY_RECIPES_URL ||
  (process.env.BACKEND_URL
    ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/recipes`
    : null);

if (!legacyRecipesUrl) {
  console.error(
    "Missing LEGACY_RECIPES_URL (or BACKEND_URL). Example: LEGACY_RECIPES_URL=http://localhost:3001/recipes"
  );
  process.exit(1);
}

console.log(`Fetching recipes from ${legacyRecipesUrl}...`);
const response = await fetch(legacyRecipesUrl);
if (!response.ok) {
  console.error(`Failed fetch ${legacyRecipesUrl}: ${response.status}`);
  process.exit(1);
}

const payload = await response.json();
const sourceRecipes = Array.isArray(payload) ? payload : [];
const normalized = sourceRecipes
  .map(normalizeRecipe)
  .filter((recipe) => recipe.name && recipe.ingredients.length > 0);

if (normalized.length === 0) {
  console.log("No recipes to import.");
  process.exit(0);
}

console.log(`Importing ${normalized.length} recipes into Supabase...`);

const chunkSize = 200;
let inserted = 0;
for (let i = 0; i < normalized.length; i += chunkSize) {
  const chunk = normalized.slice(i, i + chunkSize);
  const { error } = await supabase.from("recipes").insert(chunk);
  if (error) {
    console.error("Insert error:", error.message);
    process.exit(1);
  }
  inserted += chunk.length;
  console.log(`Inserted ${inserted}/${normalized.length}`);
}

const { count, error: countError } = await supabase
  .from("recipes")
  .select("*", { count: "exact", head: true });
if (countError) {
  console.error("Count error:", countError.message);
  process.exit(1);
}

console.log(`Done. Supabase recipes count: ${count ?? 0}`);
