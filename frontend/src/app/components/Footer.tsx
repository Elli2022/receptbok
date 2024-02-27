//frontend/src/app/components/Footer.tsx
import React from "react";

const Footer = () => {
  return (
    <footer className="text-center py-2 mt-4 justify-center items-center text-center">
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6 relative z-10">
        <a
          href="mailto:eleonora.nocentini@gmail.com"
          className="text-xs sm:text-sm text-blue-500 hover:underline"
        >
          ELEONORA.NOCENTINI@GMAIL.COM
        </a>
        <span className="hidden sm:block">|</span>
        <a
          href="https://www.linkedin.com/in/eleonora-nocentini-sk%C3%B6ldebrink-a2a46a63/"
          className="text-xs sm:text-sm text-blue-500 hover:underline"
        >
          LINKEDIN.COM
        </a>
      </div>
      <p className="text-gray-600 text-xs sm:text-sm">
        © {new Date().getFullYear()} All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
