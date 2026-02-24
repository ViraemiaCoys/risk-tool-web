"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";

import ContactsPopover from "@/components/ContactsPopover";
import { useAuth } from "@/auth/auth.context";
import { useRouter } from "next/navigation";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";

export default function Header(props: { title: string; onToggleNav?: () => void }) {
  const router = useRouter();
  const { me, logout } = useAuth();
  const [contactsAnchor, setContactsAnchor] =
    React.useState<HTMLElement | null>(null);
  const [userMenuAnchor, setUserMenuAnchor] =
    React.useState<HTMLElement | null>(null);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleLogout = async () => {
    setUserMenuAnchor(null);
    await logout();
    router.push("/login");
  };

  const handleAccountClick = () => {
    setUserMenuAnchor(null);
    router.push("/users/account");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        width: '100%',
        backgroundColor: "rgba(18,18,18,0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: 64, gap: { xs: 1, sm: 0 } }}>
        {props.onToggleNav ? (
          <IconButton
            color="inherit"
            edge="start"
            onClick={props.onToggleNav}
            sx={{ display: { md: "none" }, mr: 1 }}
            aria-label="open navigation"
          >
            <MenuIcon />
          </IconButton>
        ) : null}

        {/* Page title */}
        <Typography variant="h6" sx={{ fontWeight: 900, textTransform: "capitalize" }}>
          {props.title}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 0.5 }}
          alignItems={{ xs: "flex-end", sm: "center" }}
          justifyContent="flex-end"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="flex-end"
            flexWrap="wrap"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {/* Search */}
            <Tooltip title="Search">
              <IconButton color="inherit" sx={{ display: { xs: "none", sm: "inline-flex" } }}>
                <SearchIcon />
              </IconButton>
            </Tooltip>

            {/* Language */}
            <Tooltip title="Language">
              <IconButton color="inherit" sx={{ display: { xs: "none", sm: "inline-flex" } }}>
                <LanguageIcon />
              </IconButton>
            </Tooltip>

            {/* Team Contacts */}
            <Tooltip title="Team contacts">
              <IconButton
                color="inherit"
                onClick={(e) => setContactsAnchor(e.currentTarget)}
                sx={{ display: { xs: "none", md: "inline-flex" } }}
              >
                <PeopleOutlineIcon />
              </IconButton>
            </Tooltip>

            <ContactsPopover
              anchorEl={contactsAnchor}
              onClose={() => setContactsAnchor(null)}
            />

            {/* Settings */}
            <Tooltip title="Settings">
              <IconButton color="inherit" sx={{ display: { xs: "none", md: "inline-flex" } }}>
                <SettingsOutlinedIcon />
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={4} color="error">
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User avatar */}
            <Tooltip title="账户">
              <IconButton
                onClick={handleUserMenuClick}
                sx={{ ml: { xs: 0, md: 1 } }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                  src={me?.avatar_url}
                >
                  {me?.name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={() => setUserMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              bgcolor: "rgba(20,20,20,0.98)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 2,
              minWidth: 200,
            },
          }}
        >
          <MenuItem
            disabled
            sx={{
              opacity: 0.7,
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {me?.name || "用户"}
          </MenuItem>
          <MenuItem
            onClick={handleAccountClick}
            sx={{
              fontWeight: 400,
            }}
          >
            <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20 }} />
            账户设置
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{
              fontWeight: 400,
              color: "error.light",
            }}
          >
            <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
            登出
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
