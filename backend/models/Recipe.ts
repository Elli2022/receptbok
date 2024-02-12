import mongoose, { Schema, Document } from "mongoose";

interface IRecipe extends Document {
  name: string;
  description?: string;
  portions?: number;
  ingredients: string[];
  instructions?: string[];
  createdAt: Date;
}

const recipeSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  portions: { type: Number },
  ingredients: { type: [String], required: true },
  instructions: { type: [String] },
  createdAt: { type: Date, default: Date.now },
});

// Skapa ett textindex
recipeSchema.index({
  name: "text",
  description: "text",
  ingredients: "text",
  instructions: "text",
});

const Recipe = mongoose.model<IRecipe>("Recipe", recipeSchema);

export default Recipe;
