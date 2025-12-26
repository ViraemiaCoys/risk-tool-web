// src/components/AppShell.tsx
"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import Nav from "@/components/Nav";
import Header from "@/components/Headers";

export default function AppShell(props: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Nav />

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Header title={props.title} />

        <Box
          component="main"
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {/* 关键：内容区域做 maxWidth + 居中，避免超宽屏“铺太开” */}
          <Box sx={{ maxWidth: 1200, mx: "auto" }}>{props.children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
