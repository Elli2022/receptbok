// pages/api/recipes.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/recipes`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching recipes" });
  }
}
