"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import DashboardIcon from "@mui/icons-material/Dashboard";

// 新增：dashboard 这些条目的图标
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

type NavLeaf = {
  key: string;
  label: string;
  href: string;
  match?: "exact" | "prefix";
  icon?: React.ReactNode; // ✅ 新增：叶子节点也可有 icon
};

type NavParent = {
  key: string;
  label: string;
  icon: React.ReactNode;
  children: NavLeaf[];
};

type NavSection = {
  key: string;
  label: string;
  items: (NavLeaf | NavParent)[];
};

const drawer_width_open = 260;
const drawer_width_closed = 72;

const nav_sections: NavSection[] = [
  {
    key: "main",
    label: "overview",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/", match: "exact", icon: <DashboardIcon /> },

      // 下面这些就是你截图那种“多加几个条目”
      { key: "ecommerce", label: "Ecommerce", href: "/ecommerce", match: "prefix", icon: <ShoppingBagOutlinedIcon /> },
      { key: "analytics", label: "Analytics", href: "/analytics", match: "prefix", icon: <AnalyticsOutlinedIcon /> },
      { key: "banking", label: "Banking", href: "/banking", match: "prefix", icon: <AccountBalanceOutlinedIcon /> },
      { key: "booking", label: "Booking", href: "/booking", match: "prefix", icon: <EventAvailableOutlinedIcon /> },
      { key: "file", label: "File", href: "/file", match: "prefix", icon: <InsertDriveFileOutlinedIcon /> },
      { key: "course", label: "Course", href: "/course", match: "prefix", icon: <SchoolOutlinedIcon /> },
    ],
  },
  {
    key: "management",
    label: "management",
    items: [
      {
        key: "user",
        label: "User",
        icon: <PeopleIcon />,
        children: [
          { key: "user-profile", label: "Profile", href: "/users/profile", match: "prefix" },
          { key: "user-cards", label: "Cards", href: "/users/cards", match: "prefix" },
          { key: "user-list", label: "List", href: "/users", match: "exact" },
          { key: "user-create", label: "Create", href: "/users/create", match: "prefix" },
          { key: "user-edit", label: "Edit", href: "/users/edit", match: "prefix" },
          { key: "user-account", label: "Account", href: "/users/account", match: "prefix" },
        ],
      },
      {
        key: "company",
        label: "Company",
        icon: <BusinessIcon />,
        children: [
          { key: "company-list", label: "List", href: "/companies", match: "exact" },
          { key: "company-details", label: "Details", href: "/companies/details", match: "prefix" },
        ],
      },
    ],
  },
];

function is_active_path(pathname: string, href: string, match: "exact" | "prefix" = "prefix") {
  if (href === "/") return pathname === "/";

  if (match === "exact") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(href + "/");
}

function is_parent_item(item: NavLeaf | NavParent): item is NavParent {
  return (item as NavParent).children !== undefined;
}

export default function Nav() {
  const pathname = usePathname();

  const [drawer_open, set_drawer_open] = React.useState(true);
  const [parent_open_map, set_parent_open_map] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const initial: Record<string, boolean> = {};
    for (const section of nav_sections) {
      for (const item of section.items) {
        if (is_parent_item(item)) {
          const should_open = item.children.some((child) =>
            is_active_path(pathname, child.href, child.match)
          );
          initial[item.key] = should_open;
        }
      }
    }
    set_parent_open_map((prev) => ({ ...initial, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggle_drawer = () => set_drawer_open((v) => !v);

  const toggle_parent = (parent_key: string) => {
    set_parent_open_map((prev) => ({ ...prev, [parent_key]: !prev[parent_key] }));
  };

  const current_width = drawer_open ? drawer_width_open : drawer_width_closed;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: current_width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: current_width,
          overflowX: "hidden",
          boxSizing: "border-box",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.shortest,
            }),
        },
      }}
    >
      {/* top brand */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: drawer_open ? "space-between" : "center",
          px: drawer_open ? 2 : 0,
          py: 1.5,
          minHeight: 64,
        }}
      >
        {drawer_open ? (
          <Box>
            <Typography fontWeight={800}>Team 1</Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Free
            </Typography>
          </Box>
        ) : (
          <Tooltip title="Team 1" placement="right">
            <Typography fontWeight={800}>T1</Typography>
          </Tooltip>
        )}

        <IconButton onClick={toggle_drawer} size="small" aria-label="toggle sidebar">
          {drawer_open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ px: drawer_open ? 1 : 0.5, py: 1 }}>
        {nav_sections.map((section) => (
          <Box key={section.key} sx={{ mb: 1 }}>
            {section.label ? (
              <Typography
                variant="caption"
                sx={{
                  px: drawer_open ? 2 : 1,
                  py: 1,
                  fontWeight: 800,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  opacity: 0.7,
                }}
              >
                {drawer_open ? section.label : ""}
              </Typography>
            ) : null}

            {section.items.map((item) => {
              // 叶子节点（Dashboard / Ecommerce / Analytics ...）
              if (!is_parent_item(item)) {
                const active = is_active_path(pathname, item.href, item.match);

                const row = (
                  <ListItemButton
                    selected={active}
                    sx={{
                      borderRadius: 2,
                      mx: drawer_open ? 1 : 0.5,
                      mb: 0.5,
                      justifyContent: drawer_open ? "flex-start" : "center",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: drawer_open ? 42 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      {/* ✅ 不再写死 DashboardIcon，而是用 item.icon */}
                      {item.icon ?? <DashboardIcon />}
                    </ListItemIcon>
                    {drawer_open ? <ListItemText primary={item.label} /> : null}
                  </ListItemButton>
                );

                return drawer_open ? (
                  <Box
                    key={item.key}
                    component={Link}
                    href={item.href}
                    sx={{ textDecoration: "none", color: "inherit" }}
                  >
                    {row}
                  </Box>
                ) : (
                  <Tooltip key={item.key} title={item.label} placement="right">
                    <Box
                      component={Link}
                      href={item.href}
                      sx={{ textDecoration: "none", color: "inherit" }}
                    >
                      {row}
                    </Box>
                  </Tooltip>
                );
              }

              // 父节点：可展开（User / Company）
              const parent_active = item.children.some((child) =>
                is_active_path(pathname, child.href, child.match)
              );
              const parent_open = Boolean(parent_open_map[item.key]);

              return (
                <Box key={item.key} sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => toggle_parent(item.key)}
                    selected={parent_active}
                    sx={{
                      borderRadius: 2,
                      mx: drawer_open ? 1 : 0.5,
                      justifyContent: drawer_open ? "space-between" : "center",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon
                        sx={{
                          minWidth: drawer_open ? 42 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>

                      {drawer_open ? <ListItemText primary={item.label} /> : null}
                    </Box>

                    {drawer_open ? (parent_open ? <ExpandLessIcon /> : <ExpandMoreIcon />) : null}
                  </ListItemButton>

                  {/* 子菜单 */}
                  <Collapse in={drawer_open ? parent_open : true} timeout="auto" unmountOnExit>
                    <Box
                      sx={{
                        position: "relative",
                        ml: drawer_open ? 3.25 : 0,
                        mt: 0.5,
                        mb: 0.5,
                        "&:before": drawer_open
                          ? {
                              content: '""',
                              position: "absolute",
                              left: 14,
                              top: 0,
                              bottom: 0,
                              width: "2px",
                              bgcolor: "rgba(255,255,255,0.10)",
                              borderRadius: 1,
                            }
                          : {},
                      }}
                    >
                      <List disablePadding>
                        {item.children.map((child) => {
                          const child_active = is_active_path(pathname, child.href, child.match);

                          const child_row = (
                            <ListItemButton
                              selected={child_active}
                              sx={{
                                borderRadius: 2,
                                mx: drawer_open ? 1 : 0.5,
                                mb: 0.25,
                                pl: drawer_open ? 4 : 1.25,
                                justifyContent: drawer_open ? "flex-start" : "center",
                              }}
                            >
                              {drawer_open ? <ListItemText primary={child.label} /> : null}
                            </ListItemButton>
                          );

                          return drawer_open ? (
                            <Box
                              key={child.key}
                              component={Link}
                              href={child.href}
                              sx={{ textDecoration: "none", color: "inherit" }}
                            >
                              {child_row}
                            </Box>
                          ) : (
                            <Tooltip
                              key={child.key}
                              title={`${item.label} / ${child.label}`}
                              placement="right"
                            >
                              <Box
                                component={Link}
                                href={child.href}
                                sx={{ textDecoration: "none", color: "inherit" }}
                              >
                                <ListItemButton
                                  selected={child_active}
                                  sx={{
                                    borderRadius: 2,
                                    mx: 0.5,
                                    mb: 0.25,
                                    justifyContent: "center",
                                  }}
                                />
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </List>
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
