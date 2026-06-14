/** Legacy fallback images for recipes without DB image paths. */
export const EMBEDDED_RECIPE_IMAGE_BY_ID: Record<string, string> = {
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

/** Resolve a recipe image for server responses — prefer DB, fallback to legacy map. */
export function resolveRecipeImageForServer(
  recipeId: string | undefined | null,
  rawImage: string | null | undefined
): string {
  const image = (rawImage ?? "").trim();
  if (image && !image.startsWith("data:")) {
    return image;
  }

  if (recipeId && EMBEDDED_RECIPE_IMAGE_BY_ID[recipeId]) {
    return EMBEDDED_RECIPE_IMAGE_BY_ID[recipeId];
  }

  return "";
}

export const resolveRecipeImage = resolveRecipeImageForServer;
