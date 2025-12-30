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

/** ===== unified dark glass card style ===== */
const glass_card_sx = {
  borderRadius: 4,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.10)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
} as const;

const dark_textfield_sx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.03)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.14)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.22)" },
    "&.Mui-focused fieldset": { borderColor: "rgba(46, 204, 113, 0.9)" },
  },
  "& .MuiInputBase-input": { color: "rgba(255,255,255,0.92)" },
  "& .MuiOutlinedInput-input": { color: "rgba(255,255,255,0.92)" },
} as const;

function StatCard(props: { follower: string; following: string }) {
  return (
    <Card sx={{ ...glass_card_sx, width: "100%" }}>
      <CardContent sx={{ py: 2.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 2, borderColor: "rgba(255,255,255,0.10)" }}
            />
          }
        >
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
              {props.follower}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Followers
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

function AboutCard(props: { user: any }) {
  const { user } = props;

  return (
    <Card sx={{ ...glass_card_sx, width: "100%" }}>
      <CardContent>
        <Typography sx={{ fontWeight: 900, fontSize: 18, mb: 1 }}>
          About
        </Typography>

        <Typography variant="body2" sx={{ opacity: 0.82, lineHeight: 1.8 }}>
          Tart I love sugar plum I love oat cake. Sweet roll caramels I love
          jujubes. Topping cake wafer...
        </Typography>

        <Stack spacing={1.25} sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <LocationOnIcon fontSize="small" sx={{ opacity: 0.75 }} />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Live at <b>United Kingdom</b>
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <EmailIcon fontSize="small" sx={{ opacity: 0.75 }} />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {user.email}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <WorkIcon fontSize="small" sx={{ opacity: 0.75 }} />
            <Typography
              variant="body2"
              sx={{ opacity: 0.9, textTransform: "capitalize" }}
            >
              {user.role} at <b>Gleichner, Mueller and Tromp</b>
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ComposerCard() {
  return (
    <Card sx={{ ...glass_card_sx, width: "100%" }}>
      <CardContent sx={{ pb: 2.2 }}>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Share what you are thinking here..."
          sx={dark_textfield_sx}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          sx={{ mt: 2 }}
          spacing={1.5}
        >
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip
              icon={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ImageIcon fontSize="small" />
                  <VideocamIcon fontSize="small" sx={{ ml: 0.3 }} />
                </Box>
              }
              label="Image/Video"
              variant="outlined"
              sx={{
                fontWeight: 800,
                borderColor: "rgba(255,255,255,0.16)",
                color: "rgba(255,255,255,0.85)",
                bgcolor: "rgba(255,255,255,0.02)",
              }}
            />
            <Chip
              icon={<LiveTvIcon fontSize="small" />}
              label="Streaming"
              variant="outlined"
              sx={{
                fontWeight: 800,
                borderColor: "rgba(255,255,255,0.16)",
                color: "rgba(255,255,255,0.85)",
                bgcolor: "rgba(255,255,255,0.02)",
              }}
            />
          </Stack>

          <Button
            variant="contained"
            sx={{
              borderRadius: 999,
              fontWeight: 900,
              textTransform: "none",
              px: 3,
              alignSelf: { xs: "flex-end", sm: "auto" },
            }}
          >
            Post
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FeedPostCard(props: { post: post_item }) {
  const { post } = props;

  return (
    <Card sx={{ ...glass_card_sx, width: "100%" }}>
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

        <Typography
          variant="body2"
          sx={{ mt: 2, opacity: 0.88, lineHeight: 1.8 }}
        >
          {post.content}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ProfileHeader(props: {
  user: any;
  tab: profile_tab_key;
  on_tab_change: (v: profile_tab_key) => void;
}) {
  const { user, tab, on_tab_change } = props;

  return (
    <Card sx={{ ...glass_card_sx, overflow: "hidden", width: "100%" }}>
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={user.cover_url}
          alt="cover"
          sx={{
            height: { xs: 200, md: 280 },
            objectFit: "cover",
            filter: "saturate(1.05)",
          }}
        />

        {/* dark glass overlay bar */}
        <Box
          sx={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16,
            borderRadius: 4,
            background: "rgba(10,10,10,0.55)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(12px)",
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 2.2 },
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          {/* avatar */}
          <Box
            sx={{
              width: 74,
              height: 74,
              borderRadius: "50%",
              bgcolor: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.14)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Avatar
              src={user.avatar_url}
              alt={user.name}
              sx={{ width: 62, height: 62 }}
            />
          </Box>

          {/* name + role */}
          <Box sx={{ minWidth: 180, flex: "1 1 auto", minHeight: 1 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 900, lineHeight: 1.15 }}>
              {to_title_case(user.name)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.75,
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              {to_role_short(user.role)}
            </Typography>
          </Box>

          {/* tabs */}
          <Box sx={{ flex: "1 1 520px", minWidth: 280 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => on_tab_change(v)}
              variant="scrollable"
              scrollButtons="auto"
              textColor="inherit"
              indicatorColor="primary"
              sx={{
                minHeight: 44,
                "& .MuiTab-root": {
                  minHeight: 44,
                  textTransform: "none",
                  fontWeight: 900,
                  opacity: 0.85,
                  px: 2,
                },
              }}
            >
              <Tab
                value="profile"
                icon={<PersonIcon fontSize="small" />}
                iconPosition="start"
                label="Profile"
              />
              <Tab
                value="followers"
                icon={<FavoriteIcon fontSize="small" />}
                iconPosition="start"
                label="Followers"
              />
              <Tab
                value="friends"
                icon={<GroupIcon fontSize="small" />}
                iconPosition="start"
                label="Friends"
              />
              <Tab
                value="gallery"
                icon={<PhotoLibraryIcon fontSize="small" />}
                iconPosition="start"
                label="Gallery"
              />
            </Tabs>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

function PlaceholderTabCard(props: { title: string }) {
  return (
    <Card sx={{ ...glass_card_sx, width: "100%" }}>
      <CardContent>
        <Typography sx={{ fontWeight: 900, fontSize: 18, mb: 1 }}>
          {props.title}
        </Typography>
        <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.10)" }} />
        <Typography variant="body2" sx={{ opacity: 0.82 }}>
          This tab is a placeholder. You can wire it to real data later.
        </Typography>
      </CardContent>
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

  const [tab, set_tab] = React.useState<profile_tab_key>("profile");

  if (!user) {
    return (
      <Box sx={{ width: "100%", minWidth: 0, px: { xs: 2, md: 3 }, py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Profile
        </Typography>
        <Typography sx={{ mt: 1, opacity: 0.8 }}>user not found: {user_id}</Typography>
        <Typography sx={{ mt: 1, opacity: 0.8 }}>
          available ids: {users_mock.map((x: any) => x.user_id).join(", ")}
        </Typography>
      </Box>
    );
  }

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
    <Box
      sx={{
        width: "100%",
        maxWidth: "none",
        minWidth: 0,
        px: { xs: 2, md: 3 }, // ✅ 给页面一个正常产品的内边距（你之前是 0）
        py: { xs: 2, md: 3 },
      }}
    >
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
        <ProfileHeader user={user} tab={tab} on_tab_change={set_tab} />
      </Box>

      {/* body */}
      <Grid container spacing={3} alignItems="stretch">
        {/* ✅ 左小右大：从 md 就开始，不要等 lg */}
        <Grid item xs={12} md={4} lg={4}>
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <StatCard follower={user.followers} following={user.following} />
            <AboutCard user={user} />
          </Stack>
        </Grid>

        <Grid item xs={12} md={8} >
          {/* ✅ 右侧不允许“收缩” */}
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <ComposerCard />

            {/* ✅ 内容区容器：固定宽度 + 最小高度，切 tab 不会视觉塌陷/像缩小 */}
            <Box sx={{ width: "100%", minWidth: 0, minHeight: 360 }}>
              {tab === "profile" ? (
                <Stack spacing={3} sx={{ width: "100%", minWidth: 0 }}>
                  {posts.map((p) => (
                    <FeedPostCard key={p.id} post={p} />
                  ))}
                </Stack>
              ) : (
                <PlaceholderTabCard
                  title={
                    tab === "followers"
                      ? "Followers"
                      : tab === "friends"
                      ? "Friends"
                      : "Gallery"
                  }
                />
              )}
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
