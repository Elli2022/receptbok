import React, { useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useRouter } from "next/router";
import { notifyAuthChange } from "@/lib/auth/local-user";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const { email, password } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || data.message || "Inloggningen misslyckades.");
      }

      localStorage.setItem("receptbok.user", JSON.stringify(data.user));
      notifyAuthChange();
      router.push("/recept");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Inloggningen misslyckades. Kontrollera dina uppgifter."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Logga in</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={(e) => onSubmit(e)}>
          <div className="mb-4">
            <label className="block text-gray-700">E-post</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => onChange(e)}
              required
              className="mt-1 p-2 w-full border rounded text-black placeholder-gray-500"
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
              className="mt-1 p-2 w-full border rounded text-black placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 text-white p-2 rounded w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
