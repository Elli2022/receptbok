import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// Definierar en typ för att matcha min receptdata (Interface för Recept)
interface Recept {
  _id: string;
  name: string;
  description: string;
  image: string;
  source_image: string;
  portions: string;
  ingredients: string[];
  instructions: string[];
}

const ReceptDetalj = () => {
  const router = useRouter();
  const { id } = router.query;
  const [recept, setRecept] = useState<Recept | null>(null);
  const [checkedStates, setCheckedStates] = useState<{
    [index: number]: boolean;
  }>({});

  useEffect(() => {
    const fetchRecept = async () => {
      if (id && typeof id === "string") {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/recipes/${id}`
          );
          const data: Recept = await response.json();
          setRecept(data);
          // Initiera checkedStates baserat på antalet instruktioner
          const initialState = data.instructions.reduce(
            (acc, _, index) => ({
              ...acc,
              [index]: false,
            }),
            {}
          );
          setCheckedStates(initialState);
        } catch (error) {
          console.error("Kunde inte hämta recept", error);
        }
      }
    };

    fetchRecept();
  }, [id]);

  const handleCheckboxChange = (index: number) => {
    setCheckedStates((prevStates) => ({
      ...prevStates,
      [index]: !prevStates[index], // Växlar värdet för givet index
    }));
  };

  if (!recept) return <p>Laddar...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Navbar />
      <h1 className="text-4xl font-bold mb-4">{recept.name}</h1>
      <img src={recept.image} alt={recept.name} />
      <p>Bild lånad från: {recept.source_image}</p>
      <br />
      <p>{recept.description}</p>
      <br />
      <p>Portioner:{recept.portions}</p>
      <br />
      <div>
        <h2 className="text-2xl font-bold mb-2">Ingredienser</h2>
        <ul>
          {recept.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>
      <br />
      <div>
        <h2 className="text-2xl font-bold mb-2">Instruktioner</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {recept.instructions.map((instruction, index) => (
            <label
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: checkedStates[index] ? "gray" : "inherit", // Korrekt konditionell styling
              }}
            >
              <input
                type="checkbox"
                checked={checkedStates[index] || false} // Kontrollerar checkboxens tillstånd
                onChange={() => handleCheckboxChange(index)} // Uppdaterar tillståndet vid ändring
              />
              {instruction}
            </label>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReceptDetalj;
