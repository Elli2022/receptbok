import { AppProps } from "next/app";
import Head from "next/head";
import PwaRegistrar from "@/app/components/PwaRegistrar";
import "../app/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Receptbok</title>
        <meta
          name="description"
          content="En personlig receptbok för att hitta, spara och laga favoritrecept."
        />
        <meta name="theme-color" content="#047857" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Receptbok" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icons/icon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <PwaRegistrar />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
