const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

const recipeUrl = (id) => `${backendUrl?.replace(/\/$/, "")}/recipes/${id}`;

export default async function handler(req, res) {
  const { id } = req.query;

  if (!backendUrl) {
    return res.status(404).json({
      message: "Ingen databas är kopplad för serverrecept.",
    });
  }

  try {
    if (req.method === "GET") {
      const response = await fetch(recipeUrl(id));
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    if (req.method === "PUT" || req.method === "DELETE") {
      const response = await fetch(recipeUrl(id), {
        method: req.method,
        headers: { "Content-Type": "application/json" },
        body: req.method === "PUT" ? JSON.stringify(req.body) : undefined,
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  } catch (error) {
    return res.status(500).json({
      message: "Kunde inte hämta receptet.",
      error: error instanceof Error ? error.message : "Okänt fel",
    });
  }
}
