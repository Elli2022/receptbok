//pages/recept.tsx
import React, { ReactNode } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

// Typdefinitioner (anpassa dessa baserat på din datastruktur)
type Recept = {
  [x: string]: ReactNode;
  _id: string;
  name: string;
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

// Komponent för att visa enskilda recept
const ReceptPage = ({ recept }: { recept: Recept[] }) => {
  return (
    <div className="max-w-8xl mx-auto px-4 py-8">
      <Navbar />
      <h1 className="text-4xl font-bold text-center mb-8">Recept</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recept.map((recept) => (
          <Link key={recept._id} href={`/recept/${recept._id}`} passHref>
            <div className="text-black bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
              <img
                src={recept.image}
                alt={recept.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{recept.name}</h2>
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
