//frontend/pages/recept.tsx
import React, { useEffect, useState } from "react";
import axios from 'axios';
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

// Hämtar recept från servern
export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/recipes`);
    const data = await res.json();

    // Kontrollera att recept är en array
    if (!Array.isArray(data)) {
      throw new Error("API response is not an array");
    }

    return {
      props: { recept: data },
    };
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return {
      props: { recept: [] }, // Returnera en tom array vid fel
    };
  }
}

const ReceptPage = ({ recept }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecept, setFilteredRecept] = useState<Recept[]>([]);
  const [newRecipe, setNewRecipe] = useState({
    name: "Ellis Vegetariska Lasagne",
    category: "huvudrätt, pasta",
    portions: 4,
    description: "",
    ingredients: "12 torkade lasagneplattor, 500 g vegofärs (gärna Anammas), soffrito på 2 gula löökar, två morötter och en stor selleristjälk, 2 msk olivolja, 1 dl tomatpuré, 400 g krossade tomater, 2 vegetariska buljongtärningar, 1 dl vatten",
    instructions: "Ugn 200°.\nSkala och hacka lök fint.\nStek löken riktigt mjuk i olja på medelvärme i en stekpanna. Tillsätt färs, lite i taget så att färsen bryns och får färg utan att koka. Tillsätt tomatpurén och låt fräsa med någon minut.\nTillsätt krossad tomat, buljongtärning, vatten och kryddor.\nLåt sjuda ca 15 minuter under omrörning då och då.\nSmaka av med salt och peppar. Var inte rädd för att krydda på. I kombination med ostsåsen och pastan mildras smakerna mycket.\nBechamelsås: Smält smöret i en kastrull. Vispa ned mjölet med en ballongvisp så att det blir en klumpfri smet. Vispa sedan ner mjölken, lite i taget.\nLåt bechamelsåsen koka upp och sen sjuda under omrörning med visp tills den tjocknar, ca 2–4 minuter. Rör hela tiden, mjölk bränner lätt fast i bottnen.\nSmaka av med salt och peppar. Dra av från värmen och rör i riven ost.\nVarva bechamelsås, lasagneplattor och köttfärssås i en ugnsfast form, ca 25x30 cm. Börja och avsluta med ett lager bechamelsås och toppa med mer riven ost om du vill. 3 lasagneplattor/lager är lagom.\nTillaga lasagnen i mitten av ugnen, 200°, enligt anvisning på förpackningen till lasagneplattorna.",
    image: "", // Länken till bilden
    source_image: "Recept.se"
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (Array.isArray(recept)) {
      const filterRecept = recept.filter((receptItem) => {
        const searchTermLower = searchTerm.toLowerCase();
        const name = receptItem.name ? receptItem.name.toLowerCase() : "";
        const category = receptItem.category ? receptItem.category.toLowerCase() : "";
        const ingredientsString = receptItem.ingredients.join(" ").toLowerCase();

        return (
          name.includes(searchTermLower) ||
          ingredientsString.includes(searchTermLower) ||
          category.includes(searchTermLower)
        );
      });

      setFilteredRecept(filterRecept);
    } else {
      console.error("recept is not an array");
    }
  }, [searchTerm, recept]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecipe({ ...newRecipe, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!file) {
      console.error("No file selected");
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const uploadResponse = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      const imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/${uploadResponse.data.file.filename}`;
      console.log('Image URL:', imageUrl); // Log URL
  
      const recipeToSend = {
        ...newRecipe,
        ingredients: newRecipe.ingredients.split(',').map(ingredient => ingredient.trim()),
        image: imageUrl
      };
  
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/recipes`, recipeToSend);
      console.log('Receptet har sparats:', response.data); // Log response data
  
      // Lägg till det nya receptet till listan så att det visas omedelbart
      setFilteredRecept([...filteredRecept, response.data]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Det gick inte att spara receptet:', error.message);
        console.error('Axios error details:', error.toJSON());
      } else {
        console.error('Ett oväntat fel inträffade:', error);
      }
    }
  };
  
  return (
    <div className="max-w-8xl mx-auto px-4 py-8">
      <Navbar />
      <h1 className="text-4xl font-bold text-center mb-8">Recept</h1>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Sök efter receptnamn, ingredienser eller kategori..."
        className="mb-4 p-2 w-full text-black rounded-full"
      />

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
          Hitta dina favoritrecept eller upptäck nya spännande rätter att prova på.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="mb-8" encType="multipart/form-data">
        <h2 className="text-2xl font-bold mb-4">Lägg till nytt recept</h2>
        <input
          type="text"
          name="name"
          value={newRecipe.name}
          onChange={handleInputChange}
          placeholder="Namn"
          className="mb-2 p-2 w-full text-black rounded"
          required
        />
        <input
          type="text"
          name="category"
          value={newRecipe.category}
          onChange={handleInputChange}
          placeholder="Kategori"
          className="mb-2 p-2 w-full text-black rounded"
          required
        />
        <input
          type="number"
          name="portions"
          value={newRecipe.portions}
          onChange={handleInputChange}
          placeholder="Portioner"
          className="mb-2 p-2 w-full text-black rounded"
          required
        />
        <textarea
          name="description"
          value={newRecipe.description}
          onChange={handleInputChange}
          placeholder="Beskrivning"
          className="mb-2 p-2 w-full text-black rounded"
          required
        />
        <textarea
          name="ingredients"
          value={newRecipe.ingredients}
          onChange={handleInputChange}
          placeholder="Ingredienser (kommaseparerade)"
          className="mb-2 p-2 w-full text-black rounded"
          required
        />
        <textarea
          name="instructions"
          value={newRecipe.instructions}
          onChange={handleInputChange}
          placeholder="Instruktioner"
          className="mb-2 p-2 w-full text-black rounded"
          required
        />
        <input
          type="file"
          name="file"
          onChange={handleFileChange}
          className="mb-2 p-2 w-full text-black rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Lägg till recept
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecept.map((receptItem) => (
          <Link key={receptItem._id} href={`/recept/${receptItem._id}`} passHref>
            <div className="text-black bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
              <div className="w-full h-64 object-cover transition-transform duration-300 ease-in-out hover:scale-110">
                <img src={receptItem.image} alt={receptItem.name} className="w-full h-64 object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
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
