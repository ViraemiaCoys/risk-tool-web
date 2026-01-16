"use client";

import * as React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import theme from "@/theme/theme";
import { AuthProvider } from "@/auth/auth.context";

export default function Providers(props: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>{props.children}</AuthProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}