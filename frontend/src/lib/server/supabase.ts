import type { NextApiRequest } from "next";
import { createClient, type User } from "@supabase/supabase-js";

export type RecipeRow = {
  id: string;
  name: string;
  description: string | null;
  portions: string | number | null;
  category: string | null;
  ingredients: string[] | null;
  instructions: string[] | null;
  image: string | null;
  source_image: string | null;
  owner_id: string | null;
  owner_name: string | null;
  created_at: string | null;
};

export type ProfileRow = {
  id: string;
  name: string | null;
  username: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const recipeColumns =
  "id,name,description,portions,category,ingredients,instructions,image,source_image,owner_id,owner_name,created_at";

export const hasSupabaseConfig = () =>
  Boolean(supabaseUrl && supabasePublishableKey);

const authorizationHeader = (req?: NextApiRequest) => {
  const authorization = req?.headers.authorization;
  return typeof authorization === "string" ? authorization : "";
};

export const accessTokenFromRequest = (req: NextApiRequest) => {
  const authorization = authorizationHeader(req);
  const [scheme, token] = authorization.split(" ");

  return scheme?.toLowerCase() === "bearer" && token ? token : "";
};

export const createSupabaseServerClient = (req?: NextApiRequest) => {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase är inte kopplat ännu.");
  }

  const accessToken = req ? accessTokenFromRequest(req) : "";

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    ...(accessToken ? { accessToken: async () => accessToken } : {}),
  });
};

export const getRequestUser = async (req: NextApiRequest) => {
  const token = accessTokenFromRequest(req);

  if (!token) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
};

export const recipeFromRow = (row: RecipeRow) => ({
  _id: row.id,
  name: row.name,
  description: row.description || "",
  portions: row.portions || "",
  category: row.category || "Okategoriserat",
  ingredients: row.ingredients || [],
  instructions: row.instructions || [],
  image: row.image || "",
  source_image: row.source_image || "",
  ownerId: row.owner_id || "",
  ownerName: row.owner_name || "",
  createdAt: row.created_at || new Date().toISOString(),
});

export const publicUser = (
  user: User,
  profile: ProfileRow | null,
  favoriteIds: string[] = []
) => ({
  id: user.id,
  name:
    profile?.name ||
    String(user.user_metadata?.name || user.email || "Receptvän"),
  username:
    profile?.username ||
    String(user.user_metadata?.username || user.email || "receptvan"),
  email: user.email || "",
  favoriteIds,
});

export const profileName = (user: User, profile: ProfileRow | null) =>
  profile?.name ||
  String(user.user_metadata?.name || user.email || "Receptvän");

export const tableSetupMessage =
  "Supabase-tabellerna är inte skapade ännu. Kör filen supabase/schema.sql i Supabase SQL Editor.";

export const supabaseErrorMessage = (error: { code?: string; message?: string }) =>
  error.code === "42P01" ||
  /could not find the table|schema cache/i.test(error.message || "")
    ? tableSetupMessage
    : error.message || "Supabase kunde inte svara just nu.";
