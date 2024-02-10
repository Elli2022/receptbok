// pages/api/recipes.tsx

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

    if (!backendUrl) {
      throw new Error("DATABASE_URL är inte definierad");
    }

    const response = await fetch(backendUrl);
    const recipes = await response.json();

    // Om allt går bra, skicka recepten till klienten
    res.status(200).json(recipes);
  } catch (error) {
    // Typkontroll innan konvertering
    const errorMessage =
      error instanceof Error ? error.message : "Ett okänt fel uppstod";
    res
      .status(500)
      .json({ message: "Kunde inte hämta recept", error: errorMessage });
  }
}
