import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import store from "../src/store";
import "../src/styles/global.css";

function MyApp({ Component, pageProps }: AppProps) {
  // Track if the app has mounted on client - helps prevent hydration mismatches
  const [mounted, setMounted] = useState(false);

  // Set mounted state after hydration is complete
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Provider store={store}>
      <Head>
        <title>Task Manager</title>
        <meta name="description" content="Task management application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add a key to help React reconcile during hydration */}
        <meta
          key="hydration-key"
          name="app-version"
          content={mounted ? "client" : "server"}
        />
      </Head>

      {mounted ? (
        <Component {...pageProps} />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-solid border-indigo-500 border-r-transparent"></div>
        </div>
      )}
    </Provider>
  );
}

export default MyApp;
