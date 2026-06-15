import type { Metadata } from "next";
import SparadeClient from "./SparadeClient";

export const metadata: Metadata = {
  title: "Sparade recept",
  description: "Dina sparade favoritrecept i Receptbok.",
  robots: { index: false, follow: false },
};

export default function SparadePage() {
  return <SparadeClient />;
}
