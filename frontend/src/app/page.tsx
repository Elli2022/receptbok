import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="relative bg-gray-300 h-96">
        <img
          src="/images/heroImageLandingPage.jpg"
          alt="Hero"
          className="absolute w-full h-full"
        />{" "}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-md p-4 bg-white bg-opacity-90 rounded">
            <input
              type="text"
              placeholder="Sök recept, ingredienser..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center">Populära Kategorier</h2>
        <div className="flex justify-center space-x-4 my-4">
          {/* Kategoriknappar eller taggar går här */}
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Pasta
          </button>
          {/* Fler knappar för andra kategorier */}
        </div>

        <h2 className="text-2xl font-bold text-center">Utvalda Recept</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          {/* Receptkort kommer här, kan använda en map-funktion för att generera från data */}
          <div className="bg-white p-4 rounded shadow">
            <img
              className="w-full h-48 object-cover rounded"
              src="/path-to-recipe-image.jpg"
              alt="Receptnamn"
            />
            <h3 className="font-bold my-2">Receptnamn</h3>
            {/* Beskrivning och/eller andra detaljer */}
          </div>
          {/* Fler receptkort */}
        </div>
      </div>

      <Footer />
    </div>
  );
}
