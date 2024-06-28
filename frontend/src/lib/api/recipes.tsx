// pages/api/recipes.tsx

export default async function handler(
  req: any,
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: any): void; new (): any };
    };
  }
) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    return res.status(500).json({ message: "NEXT_PUBLIC_BACKEND_URL är inte definierad" });
  }

  try {
    if (req.method === 'GET') {
      // Hantera GET-förfrågan
      const response = await fetch(`${backendUrl}/recipes`);
      const recipes = await response.json();
      res.status(200).json(recipes);
    } else if (req.method === 'POST') {
      // Hantera POST-förfrågan
      const response = await fetch(`${backendUrl}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });
      const newRecipe = await response.json();
      res.status(201).json(newRecipe);
    } else {
      // Hantera andra metoder
      res.status(405).json({ message: "Metod inte tillåten" });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Ett okänt fel uppstod";
    res.status(500).json({ message: "Kunde inte hämta eller skicka recept", error: errorMessage });
  }
}

