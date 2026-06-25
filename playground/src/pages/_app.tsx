import type { AppProps } from "next/app";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <KindeProvider>
      <Component {...pageProps} />
    </KindeProvider>
  );
}
