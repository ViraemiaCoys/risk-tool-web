"use client";

import { useState, type ReactNode } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
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

// 登录/注册页不显示侧边栏和头部
const PUBLIC_PAGES = ["/login", "/register"];

export default function AppShell(props: { title?: string; children: ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const is_md_up = useMediaQuery(theme.breakpoints.up("md"));
  const [mobile_nav_open, set_mobile_nav_open] = useState(false);
  const resolved_title = props.title ?? title_from_path(pathname);
  const isPublicPage = PUBLIC_PAGES.includes(pathname);

  if (isPublicPage) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        {props.children}
      </Box>
    );
  }

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
      {is_md_up ? (
        <Nav variant="permanent" />
      ) : (
        <Nav
          variant="temporary"
          open={mobile_nav_open}
          onClose={() => set_mobile_nav_open(false)}
        />
      )}

      <Box sx={{ flexGrow: 1, minWidth: 0, width: "100%" }}>
        <Header
          title={resolved_title}
          onToggleNav={!is_md_up ? () => set_mobile_nav_open(true) : undefined}
        />

        <Box
          component="main"
          sx={{
            width: "100%",
            maxWidth: "var(--app-max-width)",
            mx: "auto",
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
