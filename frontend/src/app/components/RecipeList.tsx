//src/components/RecipeList.tsx

import React from "react";

type Recipe = {
  _id: string;
  name: string;
  description: string;
};

type Props = {
  recipes: Recipe[];
};

const RecipeList: React.FC<Props> = ({ recipes }) => {
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
