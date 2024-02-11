// src/components/Navbar.tsx

import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        <li style={{ display: "inline", marginRight: "20px" }}>
          <Link to="/">Hem</Link>
        </li>
        <li style={{ display: "inline", marginRight: "20px" }}>
          <Link to="/recipes">Recept</Link>
        </li>
        <li style={{ display: "inline" }}>
          <Link to="/about">Om Oss</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
