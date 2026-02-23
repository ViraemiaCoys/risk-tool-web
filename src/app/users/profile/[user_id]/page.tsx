"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/hooks/use-users";
import { uploadService } from "@/services/upload.service";
import { usersService, type UserEntity } from "@/services/users.service";
import { postsService, type PostEntity } from "@/services/posts.service";
import { useAuth } from "@/auth/auth.context";
import { getErrorMessage } from "@/lib/error-utils";

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

function to_role_short(role?: string) {
  const raw = String(role ?? "");
  const r = raw.trim().toLowerCase();
  if (!r) return "unknown";
  if (r.includes("cto")) return "cto";
  if (r.includes("ceo")) return "ceo";
  if (r.includes("hr")) return "hr";
  if (r.includes("it")) return "it";
  if (r.includes("designer")) return "designer";
  return raw.split(" ")[0] || raw;
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

function AboutCard(props: { user: UserEntity }) {
  const { user } = props;

  const location = React.useMemo(() => {
    const parts = [];
    if (user.city) parts.push(user.city);
    if (user.state_region) parts.push(user.state_region);
    if (user.country) parts.push(user.country);
    return parts.length > 0 ? parts.join(", ") : "Not specified";
  }, [user.city, user.state_region, user.country]);

  return (
    <Card sx={{ ...glass_card_sx, width: "100%" }}>
      <CardContent>
        <Typography sx={{ fontWeight: 900, fontSize: 18, mb: 1 }}>
          About
        </Typography>

        {user.about ? (
          <Typography variant="body2" sx={{ opacity: 0.82, lineHeight: 1.8, mb: 2 }}>
            {user.about}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ opacity: 0.6, lineHeight: 1.8, mb: 2, fontStyle: "italic" }}>
            No description provided.
          </Typography>
        )}

        <Stack spacing={1.25} sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <LocationOnIcon fontSize="small" sx={{ opacity: 0.75 }} />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Live at <b>{location}</b>
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <EmailIcon fontSize="small" sx={{ opacity: 0.75 }} />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {user.email}
            </Typography>
          </Stack>

          {user.company && (
            <Stack direction="row" spacing={1.25} alignItems="center">
              <WorkIcon fontSize="small" sx={{ opacity: 0.75 }} />
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, textTransform: "capitalize" }}
              >
                {user.title_role || "Employee"} at <b>{user.company}</b>
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ComposerCard(props: { user_id: string; onPost?: () => void }) {
  const [content, set_content] = React.useState("");
  const [posting, set_posting] = React.useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      alert("请输入内容");
      return;
    }

    set_posting(true);
    try {
      await postsService.create({
        content: content.trim(),
        user_id: props.user_id,
      });
      set_content("");
      props.onPost?.(); // 刷新帖子列表
    } catch (error) {
      console.error("发布失败:", error);
      alert(getErrorMessage(error, "发布失败，请重试"));
    } finally {
      set_posting(false);
    }
  };

  return (
    <Card sx={{ ...glass_card_sx, width: "100%" }}>
      <CardContent sx={{ pb: 2.2 }}>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Share what you are thinking here..."
          value={content}
          onChange={(e) => set_content(e.target.value)}
          disabled={posting}
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
            disabled={posting || !content.trim()}
            onClick={handlePost}
            sx={{
              borderRadius: 999,
              fontWeight: 900,
              textTransform: "none",
              px: 3,
              alignSelf: { xs: "flex-end", sm: "auto" },
            }}
          >
            {posting ? "发布中..." : "Post"}
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
  user: UserEntity;
  tab: profile_tab_key;
  on_tab_change: (v: profile_tab_key) => void;
  on_cover_update?: (url: string) => void;
}) {
  const { user, tab, on_tab_change, on_cover_update } = props;
  const [uploading, set_uploading] = React.useState(false);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("文件大小不能超过 5MB");
      return;
    }

    // 只允许图片
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("只支持 jpeg, jpg, png, gif 格式的图片");
      return;
    }

    set_uploading(true);
    try {
      const coverUrl = await uploadService.uploadCover(file);
      on_cover_update?.(coverUrl);
    } catch (error) {
      console.error("上传封面失败:", error);
      alert(getErrorMessage(error, "上传封面失败，请重试"));
    } finally {
      set_uploading(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  };

  return (
    <Card sx={{ ...glass_card_sx, overflow: "hidden", width: "100%" }}>
      <Box sx={{ position: "relative" }}>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          style={{ display: "none" }}
          onChange={handleCoverUpload}
        />
        <Box
          sx={{
            position: "relative",
            height: { xs: 200, md: 280 },
            bgcolor: "rgba(0,0,0,0.3)",
            cursor: on_cover_update ? "pointer" : "default",
            "&:hover": on_cover_update
              ? {
                  "& .cover-upload-overlay": {
                    opacity: 1,
                  },
                }
              : {},
          }}
          onClick={(e) => {
            if (!on_cover_update) return;
            e.preventDefault();
            e.stopPropagation();
            coverInputRef.current?.click();
          }}
        >
          {user.cover_url ? (
            <CardMedia
              component="img"
              image={user.cover_url}
              alt="cover"
              sx={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
                filter: "saturate(1.05)",
                pointerEvents: "none", // 防止图片阻止点击事件
              }}
            />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0,0,0,0.2)",
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.5 }}>
                {on_cover_update ? "点击上传封面图片" : "暂无封面图片"}
              </Typography>
            </Box>
          )}
          {on_cover_update && (
            <Box
              className="cover-upload-overlay"
              onClick={(e) => {
                e.stopPropagation();
                coverInputRef.current?.click();
              }}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
                cursor: "pointer",
                zIndex: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: "white", fontWeight: 800 }}>
                {uploading ? "上传中..." : "点击更换封面"}
              </Typography>
            </Box>
          )}
        </Box>

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
              {to_role_short(user.title_role || user.role)}
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
  const { user, loading, error } = useUser(user_id);
  const { me } = useAuth();

  const [tab, set_tab] = React.useState<profile_tab_key>("profile");
  const [localUser, set_localUser] = React.useState<UserEntity | null>(null);
  const [posts, set_posts] = React.useState<PostEntity[]>([]);
  const [loadingPosts, set_loadingPosts] = React.useState(false);

  // 判断是否当前用户（能编辑）
  const isCurrentUser = React.useMemo(() => {
    if (!me || !user_id) return false;
    // user_id 格式可能不一致，去掉 - 和 _ 再比
    return me.user_id === user_id || me.user_id?.replace(/[_-]/g, '') === user_id?.replace(/[_-]/g, '');
  }, [me, user_id]);
  
  // 开发阶段所有人能发帖，上线可改 isCurrentUser
  const canPost = true;

  React.useEffect(() => {
    if (user) {
      set_localUser({
        ...user,
        cover_url: user.cover_url ?? "",
        followers: user.followers ?? "0",
        following: user.following ?? "0",
        about: user.about ?? "",
      });
    }
  }, [user]);

  // 加载帖子
  const loadPosts = React.useCallback(async () => {
    if (!user_id) return;
    set_loadingPosts(true);
    try {
      const data = await postsService.getByUserId(user_id);
      set_posts(data || []);
    } catch (error) {
      console.error("加载帖子失败:", error);
      // API 出错就设空
      set_posts([]);
    } finally {
      set_loadingPosts(false);
    }
  }, [user_id]);

  React.useEffect(() => {
    if (tab === "profile" && user_id) {
      loadPosts();
    }
  }, [tab, user_id, loadPosts]);

  const handleCoverUpdate = async (coverUrl: string) => {
    if (!localUser) return;
    try {
      await usersService.update(user_id, { cover_url: coverUrl });
      set_localUser({ ...localUser, cover_url: coverUrl });
    } catch (error) {
      console.error("更新封面失败:", error);
    }
  };

  // 转成展示用的帖子格式
  const displayPosts: post_item[] = React.useMemo(() => {
    if (!localUser) return [];
    return (posts || []).map((post) => ({
      id: post.id,
      author_name: to_title_case(localUser.name),
      author_avatar_url: localUser.avatar_url || "",
      date_label: new Date(post.created_at).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      content: post.content,
    }));
  }, [posts, localUser]);

  if (loading) {
    return (
      <Box sx={{ width: "100%", minWidth: 0, px: { xs: 2, md: 3 }, py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Profile
        </Typography>
        <Typography sx={{ mt: 1, opacity: 0.8 }}>加载中...</Typography>
      </Box>
    );
  }

  if (error || !localUser) {
    return (
      <Box sx={{ width: "100%", minWidth: 0, px: { xs: 2, md: 3 }, py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Profile
        </Typography>
        <Typography sx={{ mt: 1, opacity: 0.8 }}>
          {error ? `加载失败: ${error.message}` : `用户未找到: ${user_id}`}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "none",
        minWidth: 0,
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      {/* title + breadcrumb */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.75 }}>
          Profile
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Dashboard &nbsp; • &nbsp; User &nbsp; • &nbsp; {to_title_case(localUser.name)}
        </Typography>
      </Box>

      {/* header */}
      <Box sx={{ mb: 3 }}>
        <ProfileHeader
          user={localUser}
          tab={tab}
          on_tab_change={set_tab}
          on_cover_update={isCurrentUser ? handleCoverUpdate : undefined}
        />
      </Box>

      {/* body */}
      <Grid container spacing={3} alignItems="stretch">
        {/* 左小右大，md 断点就开始 */}
        <Grid item xs={12} md={4} lg={4}>
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <StatCard follower={localUser.followers || "0"} following={localUser.following || "0"} />
            <AboutCard user={localUser} />
          </Stack>
        </Grid>

        <Grid item xs={12} md={8} >
          {/* 右侧固定不收缩 */}
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            {canPost && <ComposerCard user_id={user_id} onPost={loadPosts} />}

            {/* 内容区：固定宽度+最小高度，切 tab 不塌 */}
            <Box sx={{ width: "100%", minWidth: 0, minHeight: 500 }}>
              {tab === "profile" ? (
                <Stack spacing={3} sx={{ width: "100%", minWidth: 0 }}>
                  {loadingPosts ? (
                    <Typography variant="body2" sx={{ opacity: 0.7, textAlign: "center", py: 4 }}>
                      加载中...
                    </Typography>
                  ) : displayPosts.length === 0 ? (
                    <Typography variant="body2" sx={{ opacity: 0.7, textAlign: "center", py: 4 }}>
                      暂无帖子
                    </Typography>
                  ) : (
                    displayPosts.map((p) => <FeedPostCard key={p.id} post={p} />)
                  )}
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
