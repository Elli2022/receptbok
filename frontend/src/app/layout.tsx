import type { Metadata, Viewport } from "next";
import PwaRegistrar from "./components/PwaRegistrar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Receptbok",
  description: "En personlig receptbok för att hitta, spara och laga favoritrecept.",
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
  themeColor: "#047857",
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
        {children}
      </body>
    </html>
  );
}
