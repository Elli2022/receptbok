import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

// Definierar en typ för att matcha min receptdata (Interface för Recept)
interface Recept {
  _id: string;
  name: string;
  description: string;
  image: string;
  ingredients: string[];
  instructions: string[];
}

const ReceptDetalj = () => {
  const router = useRouter();
  const { id } = router.query;
  const [recept, setRecept] = useState<Recept | null>(null);

  useEffect(() => {
    const fetchRecept = async () => {
      if (id && typeof id === "string") {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/recipes/${id}`
          );
          const data: Recept = await response.json();
          setRecept(data);
        } catch (error) {
          console.error("Kunde inte hämta recept", error);
        }
      }
    };

    fetchRecept();
  }, [id]);

  if (!recept) return <p>Laddar...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{recept.name}</h1>
      <img src={recept.image} alt={recept.name} />
      <p>{recept.description}</p>
      <div>
        <h2 className="text-2xl font-bold mb-2">Ingredienser</h2>
        <ul>
          {recept.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">Instruktioner</h2>
        <ol>
          {recept.instructions.map((instruction, index) => (
            <li key={index}>
              {index + 1}: {instruction}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default ReceptDetalj;
