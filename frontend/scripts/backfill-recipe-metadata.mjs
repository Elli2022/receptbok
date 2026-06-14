#!/usr/bin/env node
/**
 * Backfill recipe metadata (meal_type, tags, prep_time_minutes) and image paths.
 * Kör: node --env-file=.env.local ./scripts/backfill-recipe-metadata.mjs
 */
import { createClient } from "@supabase/supabase-js";

const MEAL_KEYWORDS = {
  frukost: ["frukost", "morgon", "gröt", "pannkaka"],
  lunch: ["lunch", "sallad", "soppa"],
  middag: [
    "middag",
    "huvudrätt",
    "middags",
    "kyckling",
    "kött",
    "fisk",
    "pasta",
    "lasagne",
    "one pot",
  ],
  mellanmal: ["mellan", "tilltugg", "snacks"],
  dessert: ["dessert", "efterrätt", "kaka", "choklad"],
  bak: ["bak", "bröd", "bullar", "pizza", "bakverk"],
};

const KNOWN_IMAGES = {
  "b8c4e2f1-6a3d-4f5e-9c2b-1d8e7f6a5b4c": "/images/jasminas-halloumisallad.jpg",
  "9f555b7e-6322-44d7-ae67-5b04355f2481": "/images/ellis-vegetariska-lasagne.jpg",
  "580be8ad-8d58-48b2-b8a6-29e69d58f6f4": "/images/kottbullar-vegofars.jpg",
  "5e4c5d19-27d7-48d1-a5c0-a8ce07c42c29": "/images/gulls-chokladkaka.jpg",
  "f3051ec7-e4bc-4824-bad3-57f7941dabb0":
    "https://images.arla.com/recordid/F3051EC7-E4BC-4824-BAD357F7941DABBB/glutenfri-kladdkaka.jpg",
  "d4a52622-1871-449e-9b9a-d1c745fbb314": "/images/pastaBurrataSparrisCitron.jpeg",
  "678fcfba-5d01-46c2-bcd1-bf489b806a82": "/images/tahini-noodles.jpg",
  "493557ad-4761-4bce-90fa-c46a0638f34e": "/images/sesam-tahini-nudlar.jpg",
};

function recipeHaystack(recipe) {
  return [
    recipe.name,
    recipe.category,
    recipe.description,
    recipe.meal_type,
    ...(recipe.tags ?? []),
    ...(recipe.ingredients ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferMealType(recipe) {
  const haystack = `${recipe.category ?? ""} ${recipe.name ?? ""} ${recipe.description ?? ""}`.toLowerCase();
  for (const [meal, words] of Object.entries(MEAL_KEYWORDS)) {
    if (words.some((word) => haystack.includes(word))) {
      return meal;
    }
  }
  return null;
}

function inferDietTags(recipe) {
  const haystack = recipeHaystack(recipe);
  const tags = new Set();

  if (/\bvegan/i.test(haystack)) tags.add("veganskt");
  if (/vegetar/i.test(haystack)) tags.add("vegetariskt");
  if (/gluten/i.test(haystack)) tags.add("glutenfritt");
  if (
    (recipe.prep_time_minutes ?? 999) <= 30 ||
    /snabb|express|under\s*30|<\s*30\s*min/i.test(haystack)
  ) {
    tags.add("snabbt");
  }

  return [...tags];
}

function normalizeImagePath(image, recipeId) {
  const known = KNOWN_IMAGES[recipeId];
  if (known) {
    return known;
  }

  const trimmed = (image ?? "").trim();
  if (!trimmed || trimmed.startsWith("data:")) {
    return "";
  }

  if (trimmed.startsWith("/images/")) {
    return trimmed;
  }

  if (trimmed.startsWith("images/")) {
    return `/${trimmed}`;
  }

  return trimmed;
}

const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
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

const { data: recipes, error } = await supabase
  .from("recipes")
  .select(
    "id,name,description,category,ingredients,meal_type,tags,prep_time_minutes,image"
  );

if (error) {
  console.error("Kunde inte läsa recept:", error.message);
  process.exit(1);
}

let updated = 0;

for (const recipe of recipes ?? []) {
  const meal_type = recipe.meal_type || inferMealType(recipe);
  const tags =
    Array.isArray(recipe.tags) && recipe.tags.length > 0
      ? recipe.tags
      : inferDietTags({ ...recipe, meal_type });
  const image = normalizeImagePath(recipe.image, recipe.id);

  const patch = {};
  if (meal_type && meal_type !== recipe.meal_type) patch.meal_type = meal_type;
  if (tags.length > 0 && JSON.stringify(tags) !== JSON.stringify(recipe.tags ?? [])) {
    patch.tags = tags;
  }
  if (image && image !== (recipe.image ?? "")) {
    patch.image = image;
  }

  if (Object.keys(patch).length === 0) {
    continue;
  }

  const { error: updateError } = await supabase
    .from("recipes")
    .update(patch)
    .eq("id", recipe.id);

  if (updateError) {
    console.error(`Misslyckades för ${recipe.name}:`, updateError.message);
    process.exit(1);
  }

  updated += 1;
  console.log(`Uppdaterade ${recipe.name}:`, patch);
}

console.log(`Klart — ${updated} recept uppdaterade.`);
