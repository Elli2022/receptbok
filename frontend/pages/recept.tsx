//pages/recept.tsx
import React from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

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
    <div className="max-w-8xl mx-auto px-4 py-8">
      <Navbar />
      <h1 className="text-4xl font-bold text-center mb-8">Recept</h1>
      <div className="grid grid-cols-1 gap-6">
        {recept.map((recept) => (
          <div
            key={recept._id}
            className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
          >
            <div className="p-6">
              <h2 className="text-4xl font-bold mb-2 text-black">
                {recept.name}
              </h2>
              <p className="text-gray-700 mb-4">{recept.description}</p>
              <div className="mb-4">
                <h3 className="font-semibold underline text-black">
                  Ingredienser:
                </h3>
                <ul className="list-disc pl-5">
                  {recept.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-600">
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold underline text-black">
                  Instruktioner:
                </h3>
                <p className="whitespace-pre-line text-gray-600">
                  {recept.instructions}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default ReceptPage;
