// src/theme/theme.ts
"use client";

import { alpha, createTheme } from "@mui/material/styles";

export const app_theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0b0f14", // 页面底色
      paper: "#111827", // 卡片/面板底色基准
    },
    text: {
      primary: "#e5e7eb",
      secondary: alpha("#e5e7eb", 0.7),
    },
    primary: {
      main: "#22c55e",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: [
      "Inter",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: "100%" },
        body: {
          height: "100%",
          margin: 0,
          backgroundColor: "#0b0f14",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${alpha("#ffffff", 0.08)}`,
          backgroundColor: alpha("#0f172a", 0.72),
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: alpha("#ffffff", 0.08),
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: alpha("#ffffff", 0.08) },
      },
    },
  },
});

export default app_theme;
