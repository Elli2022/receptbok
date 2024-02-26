// frontend/pages/_app.tsx
import { AppProps } from "next/app";
import "../src/app/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
