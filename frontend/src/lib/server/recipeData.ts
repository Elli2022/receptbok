export const toStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const recipePayload = (body: any) => ({
  name: String(body?.name || "").trim(),
  description: String(body?.description || "").trim(),
  portions: Number(body?.portions) || body?.portions || "",
  ingredients: toStringArray(body?.ingredients),
  instructions: toStringArray(body?.instructions),
  category: String(body?.category || "Okategoriserat").trim(),
  image: String(body?.image || body?.imageUrl || body?.imageDataUrl || "").trim(),
  source_image: String(body?.source_image || "").trim(),
});
