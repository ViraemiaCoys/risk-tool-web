"use client";

import type { ContactRow } from "@/data/contact";
import { contacts as defaultContacts } from "@/data/contact";
import {
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import React from "react";

function statusColor(status: ContactRow["status"]) {
  if (status === "online") return "#22c55e"; // green
  if (status === "busy") return "#ef4444"; // red
  return "#94a3b8"; // slate/gray
}

function AvatarWithStatus(props: { name: string; status: ContactRow["status"] }) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <Avatar sx={{ width: 38, height: 38, fontWeight: 800 }}>
        {props.name.trim().charAt(0).toUpperCase()}
      </Avatar>

      <Box
        sx={{
          position: "absolute",
          right: 1,
          bottom: 1,
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: statusColor(props.status),
          border: "2px solid rgba(18,18,18,0.95)",
        }}
      />
    </Box>
  );
}

export default function ContactsPopover(props: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  contacts?: ContactRow[];
}) {
  const open = Boolean(props.anchorEl);
  const [query, setQuery] = React.useState("");

  const list = (props.contacts ?? defaultContacts).filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Popover
      open={open}
      anchorEl={props.anchorEl}
      onClose={props.onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            width: 340,
            borderRadius: 3,
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
          },
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
          Contacts ({props.contacts?.length ?? defaultContacts.length})
        </Typography>

        {/* search bar (small, like minimals) */}
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.25,
            py: 0.75,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <SearchIcon fontSize="small" />
          <InputBase
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ fontSize: 14, width: "100%" }}
          />
        </Box>
      </Box>

      <List dense sx={{ px: 1, pb: 1 }}>
        {list.map((c) => (
          <ListItemButton
            key={c.id}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              px: 1.25,
              py: 1,
            }}
            onClick={() => {
              console.log("contact clicked:", c.id);
              props.onClose();
            }}
          >
            <ListItemAvatar sx={{ minWidth: 52 }}>
              <AvatarWithStatus name={c.name} status={c.status} />
            </ListItemAvatar>

            <ListItemText
              primary={
                <Typography sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                  {c.name}
                </Typography>
              }
              secondary={
                c.lastActive ? (
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {c.lastActive}
                  </Typography>
                ) : null
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Popover>
  );
}
