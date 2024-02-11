//pages/recept.tsx
import React from "react";

// Typdefinitioner (anpassa dessa baserat på din datastruktur)
type Recept = {
  _id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
};

type Props = {
  recept: Recept[];
};

export async function getServerSideProps() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/recipes`);
  const recept = await res.json();

  return {
    props: { recept },
  };
}

// Komponent för att visa enskilda recept
const ReceptPage = ({ recept }: { recept: Recept[] }) => {
  return (
    <div>
      <h1>Recept</h1>
      {recept.map((r) => (
        <div key={r._id}>
          <h2>{r.name}</h2>
          <p>{r.description}</p>
          <h3>Ingredienser:</h3>
          <ul>
            {r.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
          <h3>Instruktioner:</h3>
          <p>{r.instructions}</p>
        </div>
      ))}
    </div>
  );
};

export default ReceptPage;
