export default async function handler(req, res) {
  const { method } = req;
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    return res.status(503).json({ msg: "Ingen användartjänst är kopplad." });
  }

  switch (method) {
    case "POST":
      try {
        const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.status(response.status).json(data);
      } catch (error) {
        console.error("Error in POST /api/users:", error);
        res.status(500).json({ msg: "Serverfel vid registrering." });
      }
      break;

    case "GET":
      try {
        const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/users`);
        const data = await response.json();
        res.status(response.status).json(data);
      } catch (error) {
        console.error("Error in GET /api/users:", error);
        res.status(500).json({ error: "Error fetching users" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Metoden ${method} är inte tillåten.`);
  }
}
