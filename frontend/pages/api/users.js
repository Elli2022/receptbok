//pages/api/users.js
import axios from "axios";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "POST":
      try {
        // Skicka POST-förfrågan till din backend
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, // Uppdaterad för att inkludera /api
          req.body,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        res.status(201).json(response.data); // Returnera backend-svaret
      } catch (error) {
        console.error("Error in POST /api/users:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
          error: error.response?.data || "Serverfel vid registrering.",
        });
      }
      break;

    case "GET":
      try {
        // Om du vill hämta användare från din backend
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users` // Endpoint med /api
        );
        res.status(200).json(response.data);
      } catch (error) {
        console.error("Error in GET /api/users:", error.response?.data || error.message);
        res.status(500).json({ error: "Error fetching users" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Metoden ${method} är inte tillåten.`);
  }
}
