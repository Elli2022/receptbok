// src/components/Navbar.tsx

import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <>
      <nav>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          <li style={{ display: "inline", marginRight: "20px" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              Hem
            </Link>
          </li>
          <li style={{ display: "inline", marginRight: "20px" }}>
            <Link href="/register" style={{ textDecoration: "none" }}>
              Registrera
            </Link>
          </li>
          <li style={{ display: "inline", marginRight: "20px" }}>
            <Link href="/recept" style={{ textDecoration: "none" }}>
              Recept
            </Link>
          </li>
          <li style={{ display: "inline" }}>
            <Link href="/about" style={{ textDecoration: "none" }}>
              Om Mig
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
