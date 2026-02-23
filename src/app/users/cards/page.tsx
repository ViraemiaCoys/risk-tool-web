"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { users_mock, type user_mock } from "@/data/user.mock";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import CloseIcon from "@mui/icons-material/Close"; // 占位：X 图标

function stat_item(label: string, value: string) {
  return (
    <Box sx={{ textAlign: "center", minWidth: 90 }}>
      <Typography variant="caption" sx={{ opacity: 0.65 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
    </Box>
  );
}

function user_profile_card(props: { user: user_mock }) {
  const { user } = props;

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
      }}
    >
      {/* cover */}
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={user.cover_url}
          alt={`${user.name} cover`}
          sx={{
            height: 160, // 缩小 cover 让一排三个
            objectFit: "cover",
          }}
        />

        {/* 白色波浪区域 */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -1,
            height: 56, // 跟随 cover 缩小
            bgcolor: "background.paper",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            clipPath: "ellipse(70% 85% at 50% 100%)",
          }}
        />

        {/* avatar floating */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            bottom: 8,
            transform: "translateX(-50%)",
            width: 78,
            height: 78,
            borderRadius: "50%",
            bgcolor: "background.paper",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
          }}
        >
          <Avatar src={user.avatar_url} alt={user.name} sx={{ width: 64, height: 64 }} />
        </Box>
      </Box>

      {/* content */}
      <CardContent sx={{ pt: 4.5, pb: 0 }}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {user.name}
          </Typography>

          {/* cards 上用 role 当作 title */}
          <Typography variant="body2" sx={{ opacity: 0.7, textTransform: "capitalize" }}>
            {user.role}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
            <IconButton size="small" aria-label="facebook">
              <FacebookIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label="instagram">
              <InstagramIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label="linkedin">
              <LinkedInIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label="x">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between" sx={{ pb: 2.25 }}>
          {stat_item("Follower", user.followers)}
          {stat_item("Following", user.following)}
          {stat_item("Total post", user.total_posts)}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const router = useRouter();

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      {/* header row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.75 }}>
            Cards
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Dashboard &nbsp; • &nbsp; User &nbsp; • &nbsp; Cards
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            px: 2,
            boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
          }}
          onClick={() => router.push("/users/create")}
        >
          Add user
        </Button>
      </Box>

      {/* grid */}
      <Grid container spacing={3}>
        {users_mock.map((user) => (
          <Grid key={user.user_id} item xs={12} sm={6} lg={4}>
            {user_profile_card({ user })}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
