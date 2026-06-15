import type { Metadata, Viewport } from "next";
import Navbar from "./components/Navbar";
import CookieNotice from "./components/CookieNotice";
import PwaRegistrar from "./components/PwaRegistrar";
import "./globals.css";

const siteUrl = "https://recipe-book-platform.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Receptbok",
    template: "%s | Receptbok",
  },
  description:
    "En personlig receptbok för att hitta, spara och laga favoritrecept — med sök, kategorier, favoriter och PWA.",
  keywords: ["recept", "matlagning", "receptbok", "favoriter", "PWA"],
  authors: [{ name: "Eleonora Nocentini" }],
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: siteUrl,
    siteName: "Receptbok",
    title: "Receptbok — din personliga receptapp",
    description:
      "Sök recept, spara favoriter och bygg din egen kokbok. Byggd med Next.js och Supabase.",
    images: [{ url: "/images/heroImageLandingPage.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Receptbok",
    description: "Din personliga receptapp med favoriter och PWA.",
    images: ["/images/heroImageLandingPage.jpg"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Receptbok",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#be123c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body>
        <PwaRegistrar />
        <Navbar />
        {children}
        <CookieNotice />
      </body>
    </html>
  );
}
