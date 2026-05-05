#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const checks = [
  "create_recipe",
  "save_favorite_recipe",
  "remove_favorite_recipe",
  "list_public_recipes",
  "get_public_recipe",
  "list_user_favorite_ids",
  "list_saved_recipes",
];

for (const fn of checks) {
  const { error } = await supabase.rpc(fn, fn === "get_public_recipe" ? { target_recipe_id: "00000000-0000-0000-0000-000000000000" } : {});
  // Some functions are expected to error without auth/valid id; we only verify existence.
  if (error && !error.message.toLowerCase().includes("inloggad") && !error.message.toLowerCase().includes("not found") && !error.message.toLowerCase().includes("invalid input syntax")) {
    console.log(`${fn}: ${error.message}`);
  } else {
    console.log(`${fn}: ok (exists)`);
  }
}

const { count, error } = await supabase.from("recipes").select("*", { count: "exact", head: true });
if (error) {
  console.error("recipes count error:", error.message);
  process.exit(1);
}
console.log(`recipes count: ${count ?? 0}`);
