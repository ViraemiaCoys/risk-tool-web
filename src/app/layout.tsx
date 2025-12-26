import type { ReactNode } from "react";
import Providers from "./providers";
import "./globals.css";

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{props.children}</Providers>
      </body>
    </html>
  );
}

