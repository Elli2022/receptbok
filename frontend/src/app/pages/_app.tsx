//src/pages/_app.tsx
import { AppProps } from "next/app";
import RootLayout from "@/app/layout"; // Uppdatera importen

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RootLayout>
      {" "}
      {/* Använd RootLayout för att omsluta ditt innehåll */}
      <Component {...pageProps} />
    </RootLayout>
  );
}

export default MyApp;
