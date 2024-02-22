// src/components/RecipeList.tsx

import React from "react";

type Recipe = {
  [x: string]: string | undefined;
  _id: string;
  name: string;
  description: string;
  ingredients: string;
  instructions: string;
};

interface RecipeListProps {
  recipes: Recipe[];
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
  if (recipes.length === 0) {
    return <p>Inga recept hittades.</p>;
  }

  return (
    <div>
      {recipes.map((recipe) => (
        <div key={recipe._id}>
          <h2>{recipe.name}</h2>
          <p>{recipe.description}</p>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
