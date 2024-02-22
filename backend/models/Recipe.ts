import mongoose, { Schema, Document } from "mongoose";

interface IRecipe extends Document {
  name: string;
  description?: string;
  portions?: number;
  ingredients: string[];
  instructions?: string[];
  image: string; // Uppdatera till strängtyp för att lagra bild-URL
  createdAt: Date;
}

const recipeSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  portions: { type: Number },
  ingredients: { type: [String], required: true },
  instructions: { type: [String] },
  createdAt: { type: Date, default: Date.now },
  image: { type: String }, // Sätt typen till sträng
});

const Recipe = mongoose.model<IRecipe>("Recipe", recipeSchema);

export default Recipe;
