const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  ingredients: [String],
  instructions: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
