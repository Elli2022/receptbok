import React from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Om Oss</h1>
        <p>
          Jag ville skapa en receptblogg där stegen var utförliga, lättlästa och
          där ingredienserna kommer i den ordningen som de ska användas i
          instruktionerna. Idéen kom från att jag tyckte att det var jobbigt att
          ha mina gluten- och nötfria recept samlade både på recept.se,
          instagram, facebook, en receptbok i pappersformat etc.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;
