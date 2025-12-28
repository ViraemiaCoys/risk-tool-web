import type { ReactNode } from "react";
import Providers from "./providers";
import "./globals.css";
import AppShell from "@/components/AppShell";

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{props.children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
