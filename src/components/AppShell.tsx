"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Header from "@/components/Headers";

function title_from_path(pathname: string) {
  if (pathname === "/") return "dashboard";
  if (pathname.startsWith("/users")) return "users";
  if (pathname.startsWith("/companies")) return "companies";
  if (pathname.startsWith("/analytics")) return "analytics";
  if (pathname.startsWith("/ecommerce")) return "ecommerce";
  if (pathname.startsWith("/banking")) return "banking";
  if (pathname.startsWith("/booking")) return "booking";
  if (pathname.startsWith("/file")) return "file";
  if (pathname.startsWith("/course")) return "course";
  return "overview";
}

export default function AppShell(props: { title?: string; children: ReactNode }) {
  const pathname = usePathname();
  const resolved_title = props.title ?? title_from_path(pathname);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        bgcolor: "background.default",
        color: "text.primary",
        overflowX: "hidden",
      }}
    >
      <Nav />

      <Box sx={{ flexGrow: 1, minWidth: 0, width: "100%" }}>
        <Header title={resolved_title} />

        <Box
          component="main"
          sx={{
            width: "100%",
            minHeight: "calc(100vh - 64px)",
            bgcolor: "background.default",
            color: "text.primary",
            px: { xs: 2, sm: 3, lg: 4 },
            py: { xs: 2, sm: 3 },
          }}
        >
          {props.children}
        </Box>
      </Box>
    </Box>
  );
}
