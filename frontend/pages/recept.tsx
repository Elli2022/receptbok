//frontend/pages/recept.tsx
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

// Typdefinitioner
type Recept = {
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

// Hämta recept från servern
export async function getServerSideProps() {
  // Ersätt `${process.env.NEXT_PUBLIC_BACKEND_URL}/recipes` med din faktiska URL
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/recipes`);
  const recept = await res.json();

  return {
    props: { recept },
  };
}

const ReceptPage = ({ recept }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecept, setFilteredRecept] = useState<Recept[]>([]);

  useEffect(() => {
    const filterRecept = recept.filter((receptItem) => {
      // Förbered söksträngar för jämförelse
      const searchTermLower = searchTerm.toLowerCase();
      const ingredientsString = receptItem.ingredients.join(" ").toLowerCase();

      // Sökning baserat på namn, ingredienser eller kategori
      return (
        receptItem.name.toLowerCase().includes(searchTermLower) ||
        ingredientsString.includes(searchTermLower) ||
        receptItem.category.toLowerCase().includes(searchTermLower)
      );
    });

    setFilteredRecept(filterRecept);
  }, [searchTerm, recept]);

  return (
    <div className="max-w-8xl mx-auto px-4 py-8">
      <Navbar />
      <h1 className="text-4xl font-bold text-center mb-8">Recept</h1>

      {/* Sökfält */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Sök efter receptnamn, ingredienser eller kategori..."
        className="mb-4 p-2 w-full text-black rounded-full"
      />

      {/* Hero sektion */}
      <div
        className="hero mb-8 p-20 text-white rounded"
        style={{
          backgroundImage: `url('/images/heroImageLandingPage.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
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

      {/* Receptkort */}
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
                {/* Eventuell ytterligare information om receptet */}
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
