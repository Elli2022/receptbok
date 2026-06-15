import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Skapa konto",
  description: "Registrera dig på Receptbok för att spara favoriter och dela recept.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterClient />
    </Suspense>
  );
}
