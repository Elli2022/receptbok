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

  const { name, username, email, password } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = JSON.stringify({ name, username, email, password });
      const res = await axios.post("/api/users", body, config);
      console.log(res.data);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Registrera dig</h1>
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
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Register
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
