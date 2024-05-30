"use client";
import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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

const Home = () => {
  const [recept, setRecept] = useState<Recept[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recept[]>([]);
  const [latestRecipes, setLatestRecipes] = useState<Recept[]>([]);
  const [inspiration, setInspiration] = useState<Recept[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/recipes');
        const data = await response.json();

        if (Array.isArray(data)) {
          setRecept(data);
          setFeaturedRecipes(data.slice(0, 3)); // Första 3 som utvalda
          setLatestRecipes(data.slice(3, 6)); // Nästa 3 som nyaste
          setInspiration(data.slice(6, 9)); // Nästa 3 som inspiration
        } else {
          console.error("API response is not an array");
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchData();
  }, []);
  

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      {/* Hero Sektion med Bakgrundsbild */}
      <div
        className="relative hero mb-8 p-20 text-white"
        style={{
          backgroundImage: `url('/images/heroImageLandingPage.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-bold mb-4">Välkommen till Receptbok</h1>
          <p className="text-xl mb-8">Hitta dina favoritrecept eller upptäck nya spännande rätter att prova på.</p>
          <div className="w-full max-w-md p-4 bg-white bg-opacity-90 rounded">
            <input
              type="text"
              placeholder="Sök recept, ingredienser..."
              className="w-full p-2 border border-gray-300 rounded text-black"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-4">Populära Kategorier</h2>
        <div className="flex justify-center space-x-4 mb-8">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600">Pasta</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600">Vegetariskt</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600">Dessert</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600">Soppor</button>
        </div>

        <h2 className="text-3xl font-bold text-center mb-4">Utvalda Recept</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {featuredRecipes.map((receptItem) => (
            <Link key={receptItem._id} href={`/recept/${receptItem._id}`} passHref>
              <div className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <img className="w-full h-48 object-cover rounded-lg mb-4" src={receptItem.image} alt={receptItem.name} />
                <h3 className="text-xl font-bold mb-2 text-black">{receptItem.name}</h3>
                <p className="text-gray-600">{receptItem.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-center mb-4">Nyaste Recepten</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {latestRecipes.map((receptItem) => (
            <Link key={receptItem._id} href={`/recept/${receptItem._id}`} passHref>
              <div className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <img className="w-full h-48 object-cover rounded-lg mb-4" src={receptItem.image} alt={receptItem.name} />
                <h3 className="text-xl font-bold mb-2 text-black">{receptItem.name}</h3>
                <p className="text-gray-600">{receptItem.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-center mb-4">Inspiration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {inspiration.map((receptItem) => (
            <Link key={receptItem._id} href={`/recept/${receptItem._id}`} passHref>
              <div className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <img className="w-full h-48 object-cover rounded-lg mb-4" src={receptItem.image} alt={receptItem.name} />
                <h3 className="text-xl font-bold mb-2 text-black">{receptItem.name}</h3>
                <p className="text-gray-600">{receptItem.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
