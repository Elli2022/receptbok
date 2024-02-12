//frontend/src/app/page.tsx
import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-8xl mx-auto px-4 py-8">
        <Navbar />
        <div>
          <h1>Välkommen till Min Receptbok</h1>
        </div>
      </div>
      <Footer />
    </main>
  );
}
