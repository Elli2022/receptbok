import React, { ReactNode, useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

// Typdefinitioner (anpassa dessa baserat på din datastruktur)
type Recept = {
  [x: string]: ReactNode;
  _id: string;
  name: string;
  category: string;
  portions: number;
  description: string;
  ingredients: string[];
  instructions: string;
  image: string;
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

const ReceptPage = ({ recept }: Props) => {
  // Söktillstånd
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecept, setFilteredRecept] = useState<Recept[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [ingredientFilter, setIngredientFilter] = useState("");

  // Uppdatera filtrerade recept baserat på sökterm
  useEffect(() => {
    let result = recept;

    if (categoryFilter) {
      result = result.filter(
        (receptItem) => receptItem.category === categoryFilter
      );
    }

    if (ingredientFilter) {
      result = result.filter((receptItem) =>
        receptItem.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(ingredientFilter.toLowerCase())
        )
      );
    }

    if (searchTerm) {
      result = result.filter((receptItem) =>
        receptItem.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecept(result);
  }, [searchTerm, categoryFilter, ingredientFilter, recept]);

  return (
    <div className="max-w-8xl mx-auto px-4 py-8">
      <Navbar />
      <h1 className="text-4xl font-bold text-center mb-8">Recept</h1>

      {/* Sökfält */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Sök efter recept..."
        className="mb-4 p-2 w-full text-black rounded-full"
      />
      <input
        type="text"
        value={ingredientFilter}
        onChange={(e) => setIngredientFilter(e.target.value)}
        placeholder="Filtrera efter ingrediens..."
        className="mb-4 p-2 text-black rounded-full"
      />

      {/* Hero Sektion med Bakgrundsbild */}
      <div
        className="hero mb-8 p-20 text-white rounded"
        style={{
          backgroundImage: `url('/images/heroImageLandingPage.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center full-width",
        }}
      >
        <h2 className="text-3xl font-bold text-center">
          Välkommen till vårt receptbibliotek!
        </h2>
        <p className="text-xl text-center">
          Hitta dina favoritrecept eller upptäck nya spännande rätter att prova
          på.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          onClick={() => setCategoryFilter("förrätt")}
        >
          Förrätter
        </button>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          onClick={() => setCategoryFilter("huvudrätt")}
        >
          Huvudrätter
        </button>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          onClick={() => setCategoryFilter("efterrätt")}
        >
          Efterrätter
        </button>
        <button
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700"
          onClick={() => setCategoryFilter("")}
        >
          Alla Kategorier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecept.map((receptItem) => (
          <Link
            key={receptItem._id}
            href={`/recept/${receptItem._id}`}
            passHref
          >
            <div className="text-black bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
              <img
                src={receptItem.image}
                alt={receptItem.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{receptItem.name}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default ReceptPage;
