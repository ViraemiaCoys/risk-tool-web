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
  Chip,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import ContactsPopover from "@/components/ContactsPopover";
import { use_auth } from "@/auth/auth.context";
import type { user_role } from "@/auth/auth.types";

export default function Header(props: { title: string }) {
  const { me, switch_role } = use_auth();
  const [contactsAnchor, setContactsAnchor] =
    React.useState<HTMLElement | null>(null);
  const [roleMenuAnchor, setRoleMenuAnchor] =
    React.useState<HTMLElement | null>(null);

  const roles: user_role[] = ["admin", "manager", "user"];

  const handleRoleClick = (event: React.MouseEvent<HTMLElement>) => {
    setRoleMenuAnchor(event.currentTarget);
  };

  const handleRoleSelect = (role: user_role) => {
    switch_role(role);
    setRoleMenuAnchor(null);
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
      <Toolbar sx={{ minHeight: 64 }}>
        {/* Page title */}
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          {props.title}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Role Switcher (开发模式) */}
        <Tooltip title={`当前角色: ${me.role} (点击切换)`}>
          <Chip
            icon={<SwapHorizIcon />}
            label={me.role.toUpperCase()}
            onClick={handleRoleClick}
            color={me.role === "admin" ? "error" : me.role === "manager" ? "warning" : "default"}
            variant="outlined"
            sx={{
              mr: 1,
              cursor: "pointer",
              fontWeight: 700,
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
              },
            }}
          />
        </Tooltip>

        {/* Role Switch Menu */}
        <Menu
          anchorEl={roleMenuAnchor}
          open={Boolean(roleMenuAnchor)}
          onClose={() => setRoleMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              bgcolor: "rgba(20,20,20,0.98)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 2,
              minWidth: 180,
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
            切换角色
          </MenuItem>
          {roles.map((role) => (
            <MenuItem
              key={role}
              selected={me.role === role}
              onClick={() => handleRoleSelect(role)}
              sx={{
                fontWeight: me.role === role ? 800 : 400,
                bgcolor: me.role === role ? "rgba(255,255,255,0.08)" : "transparent",
              }}
            >
              {role === "admin" && "👑 "}
              {role === "manager" && "🔧 "}
              {role === "user" && "👤 "}
              {role.toUpperCase()}
              {me.role === role && " (当前)"}
            </MenuItem>
          ))}
        </Menu>

        {/* Search */}
        <Tooltip title="Search">
          <IconButton color="inherit">
            <SearchIcon />
          </IconButton>
        </Tooltip>

        {/* Language */}
        <Tooltip title="Language">
          <IconButton color="inherit">
            <LanguageIcon />
          </IconButton>
        </Tooltip>

        {/* Team Contacts */}
        <Tooltip title="Team contacts">
          <IconButton
            color="inherit"
            onClick={(e) => setContactsAnchor(e.currentTarget)}
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
          <IconButton color="inherit">
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
        <Tooltip title="Account">
          <Avatar
            sx={{
              ml: 2,
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              fontSize: 14,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            U
          </Avatar>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
