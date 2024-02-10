// pages/api/recipes.js

export default async function handler(
  req: any,
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { message: string; error: any }): void; new (): any };
    };
  }
) {
  // URL till din backend
  const backendUrl = process.env.DATABASE_URL; // Ändra denna URL till din backend-server

  try {
    // Använd fetch för att anropa din backend och hämta recepten
    const response = await fetch(backendUrl);
    const recipes = await response.json();

    // Om allt går bra, skicka recepten till klienten
    res.status(200).json(recipes);
  } catch (error) {
    // Om något går fel, skicka ett felmeddelande
    res
      .status(500)
      .json({ message: "Kunde inte hämta recept", error: error.toString() });
  }
}
