"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import Nav from "@/components/Nav";
import Header from "@/components/Headers";

export default function AppShell(props: { title: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default", // ✅ 整个应用底色跟随 theme
        color: "text.primary",
      }}
    >
      <Nav />

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          bgcolor: "background.default", // ✅ 右侧内容区底色也强制跟随 theme
          color: "text.primary", // ✅ 右侧内容区也强制继承亮色
        }}
      >
        <Header title={props.title} />

        <Box
          component="main"
          sx={{
            p: 3,
            minHeight: "calc(100vh - 64px)",
            bgcolor: "background.default", // ✅ main 再压一层，彻底防覆盖
            color: "text.primary", // ✅ 再压一层，防止被局部样式覆盖
          }}
        >
          {props.children}
        </Box>
      </Box>
    </Box>
  );
}
