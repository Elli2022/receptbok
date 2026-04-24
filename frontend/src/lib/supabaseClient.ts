import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

let browserClient: ReturnType<typeof createClient> | null = null;

export const hasSupabaseConfig = () =>
  Boolean(supabaseUrl && supabasePublishableKey);

export const getSupabaseBrowserClient = () => {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase är inte kopplat ännu. Lägg till Supabase-nycklarna i Netlify."
    );
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabasePublishableKey);
  }

  return browserClient;
};
