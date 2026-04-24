import React from "react";
import Link from "next/link";

const Navbar = () => {
  const links = [
    { href: "/", label: "Hem" },
    { href: "/recept", label: "Recept" },
    { href: "/sparade", label: "Sparade" },
    { href: "/about", label: "Om" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-stone-950">
          Receptbok
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/recept#nytt-recept"
            className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Nytt recept
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
