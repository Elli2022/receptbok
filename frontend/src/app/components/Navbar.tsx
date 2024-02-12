// src/components/Navbar.tsx

import React from "react";
import Link from "next/link"; // Importera från next/link istället för react-router-dom

const Navbar = () => {
  return (
    <nav>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        <li style={{ display: "inline", marginRight: "20px" }}>
          <Link href="/">
            <a>Hem</a> {/* Använd ett <a>-element som barn till Link */}
          </Link>
        </li>
        <li style={{ display: "inline", marginRight: "20px" }}>
          <Link href="/recept">
            <a>Recept</a> {/* Använd ett <a>-element som barn till Link */}
          </Link>
        </li>
        <li style={{ display: "inline" }}>
          <Link href="/about">
            <a>Om Oss</a> {/* Använd ett <a>-element som barn till Link */}
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
