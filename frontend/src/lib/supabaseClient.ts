import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

let browserClient: ReturnType<typeof createClient> | null = null;

export const hasSupabaseConfig = () =>
  Boolean(supabaseUrl && supabasePublishableKey);

const requireSupabaseConfig = () => {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase är inte kopplat ännu. Lägg till Supabase-nycklarna i Netlify."
    );
  }
};

export const getSupabaseBrowserClient = () => {
  requireSupabaseConfig();

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  }

  return browserClient;
};
