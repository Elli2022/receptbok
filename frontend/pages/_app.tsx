// frontend/pages/_app.tsx
import { AppProps } from "next/app";
import "../src/app/globals.css";
import Footer from "@/app/components/Footer";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
