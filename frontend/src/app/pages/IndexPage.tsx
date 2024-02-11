//src/pages/IndexPage.tsx

import React, { useState } from "react";
import SearchForm from "../components/SearchForm";
import RecipeList from "../components/RecipeList";
const IndexPage = () => {
  const [recipes, setRecipes] = useState([]);

  const handleSearch = async (searchTerm: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/recipes?search=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) {
        throw new Error("Något gick fel vid hämtningen av recepten");
      }
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Fel vid sökning", error);
    }
  };

  return (
    <div>
      <h1>Välkommen till Min Receptbok</h1>
      <SearchForm onSearch={handleSearch} />
      <RecipeList recipes={recipes} />{" "}
    </div>
  );
};

export default IndexPage;
