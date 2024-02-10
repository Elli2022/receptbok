// Exempel: pages/recept.tsx
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
  // Använd den korrekta URL:en för din backend. Exempelvis: http://localhost:3001/recipes
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/recipes`);
  const recept = await res.json();

  return {
    props: { recept },
  };
}

// Komponent för att visa recept
const ReceptPage: React.FC<Props> = ({ recept }) => {
  return (
    <div>
      <h1>Recept</h1>
      <div>
        {recept.map((r) => (
          <div key={r._id}>
            <h2>{r.name}</h2>
            <p>{r.description}</p>
            {/* Rendera ytterligare detaljer här */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceptPage;
