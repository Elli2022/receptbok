const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

const recipesUrl = () => `${backendUrl?.replace(/\/$/, "")}/recipes`;

const normalizePayload = (body) => ({
  name: String(body.name || "").trim(),
  description: String(body.description || "").trim(),
  portions: Number(body.portions) || undefined,
  ingredients: Array.isArray(body.ingredients) ? body.ingredients : [],
  instructions: Array.isArray(body.instructions) ? body.instructions : [],
  category: String(body.category || "").trim(),
  image: String(body.image || "").trim(),
  source_image: String(body.source_image || "").trim(),
});

export default async function handler(req, res) {
  try {
    if (!backendUrl) {
      if (req.method === "GET") {
        return res.status(200).json([]);
      }

      return res.status(503).json({
        message: "Ingen databas är kopplad. Receptet kan sparas lokalt i appen.",
      });
    }

    if (req.method === "GET") {
      const response = await fetch(recipesUrl());
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    if (req.method === "POST") {
      const payload = normalizePayload(req.body);

      if (!payload.name || payload.ingredients.length === 0) {
        return res.status(400).json({
          message: "Namn och minst en ingrediens krävs.",
        });
      }

      const response = await fetch(recipesUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  } catch (error) {
    return res.status(500).json({
      message: "Kunde inte kontakta recepttjänsten.",
      error: error instanceof Error ? error.message : "Okänt fel",
    });
  }
}
