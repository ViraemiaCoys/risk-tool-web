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
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";

import ContactsPopover from "@/components/ContactsPopover";

export default function Header(props: { title: string }) {
  const [contactsAnchor, setContactsAnchor] =
    React.useState<HTMLElement | null>(null);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
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
