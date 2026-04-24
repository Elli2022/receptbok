const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Metoden är inte tillåten." });
  }

  if (!backendUrl) {
    return res.status(503).json({ message: "Ingen användartjänst är kopplad." });
  }

  try {
    const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Kunde inte logga in.",
      error: error instanceof Error ? error.message : "Okänt fel",
    });
  }
}
