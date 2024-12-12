//backend/models/Users.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  favorites: string[];
  correctPassword(candidatePassword: string): Promise<boolean>;
}

// Definierar ett schema för användaren
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: { type: [String], default: [] }, // En array av favoriter
});

// Hashar lösenordet innan användaren sparas
userSchema.pre("save", async function (next) {
  const user = this as IUser;
  if (!user.isModified("password")) return next();

  // Hasha lösenordet med en kostnadsfaktor (salt rounds) på 12
  user.password = await bcrypt.hash(user.password, 12);
  next();
});

// Metod för att jämföra inmatat lösenord med hashat lösenord i databasen
userSchema.methods.correctPassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
