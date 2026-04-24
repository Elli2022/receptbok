import React from "react";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Receptbok. Byggd för vardagsmat,
          favoriter och nya idéer.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <a
          href="mailto:eleonora.nocentini@gmail.com"
          className="font-medium text-emerald-700 hover:text-emerald-900"
        >
          Kontakt
        </a>
        <a
          href="https://www.linkedin.com/in/eleonora-nocentini-sk%C3%B6ldebrink-a2a46a63/"
          className="font-medium text-emerald-700 hover:text-emerald-900"
        >
          LinkedIn
        </a>
      </div>
      </div>
    </footer>
  );
};

export default Footer;
