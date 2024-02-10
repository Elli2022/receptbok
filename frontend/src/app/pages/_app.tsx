//src/pages/_app.tsx
import { AppProps } from "next/app";
import RootLayout from "@/app/layout";
import Footer from "../components/Footer";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RootLayout>
      {" "}
      {/* Använd RootLayout för att omsluta ditt innehåll */}
      <Component {...pageProps} />
      <Footer />
    </RootLayout>
  );
}

export default MyApp;
