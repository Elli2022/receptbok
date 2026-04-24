import mongoose, { Schema, models, model } from "mongoose";

const userSchema =
  models.User?.schema ||
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      username: { type: String, required: true, unique: true, trim: true },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: { type: String, required: true },
      favorites: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    },
    { timestamps: true }
  );

const recipeSchema =
  models.Recipe?.schema ||
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      description: { type: String, default: "" },
      portions: { type: Schema.Types.Mixed },
      category: { type: String, default: "Okategoriserat", trim: true },
      ingredients: { type: [String], required: true },
      instructions: { type: [String], default: [] },
      image: { type: String, default: "" },
      source_image: { type: String, default: "" },
      ownerId: { type: Schema.Types.ObjectId, ref: "User" },
      ownerName: { type: String, default: "" },
      createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
  );

export const UserModel =
  models.User || model("User", userSchema as mongoose.Schema);

export const RecipeModel =
  models.Recipe || model("Recipe", recipeSchema as mongoose.Schema);
