//frontend/src/app/page.tsx
import React from "react";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1>Välkommen till Min Receptbok</h1>
        {/* Övrigt innehåll för din startsida */}
      </div>
      <Footer />
    </main>
  );
}
