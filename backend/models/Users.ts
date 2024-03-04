import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  favorites: string;
}

// Definierar ett schema för användaren
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hashar lösenordet innan användaren sparas
userSchema.pre("save", async function (next) {
  // Kontrollera om lösenordet har modifierats (eller är nytt)
  if (!this.isModified("password")) return next();

  // Hasha lösenordet med en kostnadsfaktor (salt rounds) på 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Metod för att jämföra inmatat lösenord med hashat lösenord i databasen
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
