"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { users_mock } from "@/data/user.mock";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import FavoriteIcon from "@mui/icons-material/Favorite";
import GroupIcon from "@mui/icons-material/Group";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import LiveTvIcon from "@mui/icons-material/LiveTv";

type profile_tab_key = "profile" | "followers" | "friends" | "gallery";

type post_item = {
  id: string;
  author_name: string;
  author_avatar_url: string;
  date_label: string;
  content: string;
};

function to_title_case(s: string) {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function to_role_short(role: string) {
  const r = role.trim().toLowerCase();
  if (r.includes("cto")) return "cto";
  if (r.includes("ceo")) return "ceo";
  if (r.includes("hr")) return "hr";
  if (r.includes("it")) return "it";
  if (r.includes("designer")) return "designer";
  return role.split(" ")[0] || role;
}

function stat_card(props: { follower: string; following: string }) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ py: 2.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 2, borderColor: "rgba(255,255,255,0.12)" }}
            />
          }
        >
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
              {props.follower}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Follower
            </Typography>
          </Box>

          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
              {props.following}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Following
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function about_card(props: { user: any }) {
  const { user } = props;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography sx={{ fontWeight: 900, fontSize: 18, mb: 1 }}>About</Typography>

        <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.8 }}>
          Tart I love sugar plum I love oat cake. Sweet roll caramels I love jujubes. Topping cake wafer...
        </Typography>

        <Stack spacing={1.25} sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <LocationOnIcon fontSize="small" />
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Live at <b>United Kingdom</b>
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <EmailIcon fontSize="small" />
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {user.email}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <WorkIcon fontSize="small" />
            <Typography variant="body2" sx={{ opacity: 0.85, textTransform: "capitalize" }}>
              {user.role} at <b>Gleichner, Mueller and Tromp</b>
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function composer_card() {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ pb: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Share what you are thinking here..."
        />

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ImageIcon fontSize="small" />
                  <VideocamIcon fontSize="small" sx={{ ml: 0.3 }} />
                </Box>
              }
              label="Image/Video"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              icon={<LiveTvIcon fontSize="small" />}
              label="Streaming"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          <Button
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none" }}
          >
            Post
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function feed_post_card(props: { post: post_item }) {
  const { post } = props;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar src={post.author_avatar_url} alt={post.author_name} />
            <Box>
              <Typography sx={{ fontWeight: 900 }}>{post.author_name}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {post.date_label}
              </Typography>
            </Box>
          </Stack>

          <IconButton size="small" aria-label="more">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Typography variant="body2" sx={{ mt: 2, opacity: 0.85, lineHeight: 1.8 }}>
          {post.content}
        </Typography>
      </CardContent>
    </Card>
  );
}

function profile_header(props: {
  user: any;
  tab: profile_tab_key;
  on_tab_change: (v: profile_tab_key) => void;
}) {
  const { user, tab, on_tab_change } = props;

  return (
    <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={user.cover_url}
          alt="cover"
          sx={{
            height: { xs: 220, md: 280 },
            objectFit: "cover",
            filter: "saturate(1.05)",
          }}
        />

        {/* 底部“底座” */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: { xs: 110, md: 120 },
            bgcolor: "background.paper",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        />

        {/* avatar + name */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: 20, md: 28 },
            bottom: { xs: 28, md: 30 },
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 86,
              height: 86,
              borderRadius: "50%",
              bgcolor: "background.paper",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            }}
          >
            <Avatar src={user.avatar_url} alt={user.name} sx={{ width: 72, height: 72 }} />
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: 24, fontWeight: 900, lineHeight: 1.1 }}>
              {to_title_case(user.name)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, textTransform: "uppercase" }}>
              {to_role_short(user.role)}
            </Typography>
          </Box>
        </Box>

        {/* tabs */}
        <Box sx={{ position: "absolute", right: { xs: 12, md: 18 }, bottom: 6 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => on_tab_change(v)}
            textColor="inherit"
            indicatorColor="primary"
            sx={{
              minHeight: 44,
              "& .MuiTab-root": {
                minHeight: 44,
                textTransform: "none",
                fontWeight: 800,
                opacity: 0.85,
              },
            }}
          >
            <Tab value="profile" icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Profile" />
            <Tab value="followers" icon={<FavoriteIcon fontSize="small" />} iconPosition="start" label="Followers" />
            <Tab value="friends" icon={<GroupIcon fontSize="small" />} iconPosition="start" label="Friends" />
            <Tab value="gallery" icon={<PhotoLibraryIcon fontSize="small" />} iconPosition="start" label="Gallery" />
          </Tabs>
        </Box>
      </Box>
    </Card>
  );
}

export default function Page() {
  const params = useParams<{ user_id: string }>();
  const user_id = params.user_id;

  const user = React.useMemo(
    () => users_mock.find((u: any) => u.user_id === user_id),
    [user_id]
  );

  // 如果你想要严格 404，可以改成 notFound(); 现在先显示诊断信息更直观
  if (!user) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Profile
        </Typography>
        <Typography sx={{ mt: 1, opacity: 0.8 }}>
          user not found: {user_id}
        </Typography>
        <Typography sx={{ mt: 1, opacity: 0.8 }}>
          available ids: {users_mock.map((x: any) => x.user_id).join(", ")}
        </Typography>
      </Box>
    );
  }

  const [tab, set_tab] = React.useState<profile_tab_key>("profile");

  const posts: post_item[] = [
    {
      id: "p1",
      author_name: to_title_case(user.name),
      author_avatar_url: user.avatar_url,
      date_label: "17 Dec 2025",
      content:
        "The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.",
    },
    {
      id: "p2",
      author_name: to_title_case(user.name),
      author_avatar_url: user.avatar_url,
      date_label: "12 Dec 2025",
      content:
        "Quiet progress beats noisy plans. Shipping small improvements daily is still the best strategy.",
    },
  ];

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      {/* title + breadcrumb */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.75 }}>
          Profile
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Dashboard &nbsp; • &nbsp; User &nbsp; • &nbsp; {to_title_case(user.name)}
        </Typography>
      </Box>

      {/* header */}
      <Box sx={{ mb: 3 }}>
        {profile_header({ user, tab, on_tab_change: set_tab })}
      </Box>

      {/* body */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {stat_card({ follower: user.followers, following: user.following })}
            {about_card({ user })}
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {composer_card()}

            {tab === "profile" ? (
              <Stack spacing={3}>
                {posts.map((p) => (
                  <Box key={p.id}>{feed_post_card({ post: p })}</Box>
                ))}
              </Stack>
            ) : (
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 900, fontSize: 18, mb: 1 }}>
                    {tab === "followers"
                      ? "Followers"
                      : tab === "friends"
                      ? "Friends"
                      : "Gallery"}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    This tab is a placeholder. You can wire it to real data later.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
