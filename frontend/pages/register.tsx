//frontend/pages/register.tsx
import React, { useState } from "react";
import axios from "axios";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { name, username, email, password } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
  
      const body = { name, username, email, password };
      console.log("Sending data to backend:", body);
  
      const res = await axios.post("/api/users", body, config);
  
      console.log("Response from backend:", res.data);
      setSuccess(true);
      setFormData({ name: "", username: "", email: "", password: "" });
    } catch (error: any) {
      console.error("Error during registration:", error.response?.data || error.message);
  
      // Hantera om användaren redan finns
      if (error.response?.status === 400) {
        setError(error.response.data.msg || "Användaren finns redan");
      } else {
        setError("Ett oväntat fel inträffade. Försök igen.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Registrera dig</h1>
        {error && typeof error === "string" && (
  <p className="text-red-500 text-center mb-4">{error}</p>
)}

        {success && (
          <p className="text-green-500 text-center mb-4">
            Registrering lyckades! Du kan nu logga in.
          </p>
        )}
        <form onSubmit={(e) => onSubmit(e)}>
          <div className="mb-4">
            <label className="block text-gray-700">Namn</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => onChange(e)}
              required
              className="mt-1 p-2 w-full border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Användarnamn</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => onChange(e)}
              required
              className="mt-1 p-2 w-full border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">E-post</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => onChange(e)}
              required
              className="mt-1 p-2 w-full border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Lösenord</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => onChange(e)}
              required
              className="mt-1 p-2 w-full border rounded"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 text-white p-2 rounded w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Registrerar..." : "Registrera"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Register;