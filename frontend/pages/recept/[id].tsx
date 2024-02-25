import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

// Definiera en typ för att matcha din receptdata
interface Recept {
  _id: string;
  name: string;
  description: string;
  image: string;
  // Lägg till fler egenskaper här som matchar din datastruktur
}

const ReceptDetalj = () => {
  const router = useRouter();
  const { id } = router.query;
  // Använd den definierade typen för din state
  const [recept, setRecept] = useState<Recept | null>(null);

  useEffect(() => {
    const fetchRecept = async () => {
      if (id && typeof id === "string") {
        // Lägg till en typkontroll för id
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
      {}
    </div>
  );
};

export default ReceptDetalj;
