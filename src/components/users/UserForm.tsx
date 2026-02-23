"use client";

import * as React from "react";
import type { user_role } from "@/auth/auth.types";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { uploadService } from "@/services/upload.service";
import { getErrorMessage } from "@/lib/error-utils";

type user_status = "active" | "pending" | "banned" | "rejected";
export type user_form_mode = "create" | "edit";

export type user_form_value = {
  name: string;
  email: string;
  phone: string;
  country: string;
  state_region: string;
  city: string;
  address: string;
  zip_code: string;

  company: string;
  title_role: string; // 头衔
  permission_role: user_role; // 权限 role

  email_verified: boolean;
  status?: user_status;
  avatar_url?: string;
};

const country_options = [
  { value: "us", label: "United States", flag: "🇺🇸", dial: "+1" },
  { value: "ca", label: "Canada", flag: "🇨🇦", dial: "+1" },
  { value: "uk", label: "United Kingdom", flag: "🇬🇧", dial: "+44" },
  { value: "cn", label: "China", flag: "🇨🇳", dial: "+86" },
];

export default function UserForm(props: {
  mode: user_form_mode;
  initial_value?: Partial<user_form_value>;

  // 权限控制由 page 传入，form 里不用 useAuth
  show_permission_role?: boolean;
  allow_edit_permission_role?: boolean;

  on_submit: (value: user_form_value) => void;
  on_cancel?: () => void;
  on_delete?: () => void;
}) {
  const { mode } = props;

  const [value, set_value] = React.useState<user_form_value>(() => ({
    name: "",
    email: "",
    phone: "",
    country: "us",
    state_region: "",
    city: "",
    address: "",
    zip_code: "",
    company: "",
    title_role: "",
    permission_role: "user",
    email_verified: true,
    status: "active",
    avatar_url: "",
    ...props.initial_value,
  }));

  const [uploading, set_uploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // initial_value 变了就同步（如切换不同用户）
  React.useEffect(() => {
    if (!props.initial_value) return;
    set_value((prev) => ({ ...prev, ...props.initial_value }));
  }, [props.initial_value]);

  const update = <K extends keyof user_form_value>(key: K, next_value: user_form_value[K]) => {
    set_value((prev) => ({ ...prev, [key]: next_value }));
  };

  const field_sx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "rgba(255,255,255,0.05)",
      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&.Mui-focused fieldset": { borderColor: "primary.main" },
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.08)",
      },
      "&.Mui-focused": {
        backgroundColor: "rgba(255,255,255,0.08)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.7)",
    },
    "& .MuiInputBase-input": {
      color: "rgba(255,255,255,0.9)",
    },
  } as const;

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
        {mode === "create" ? "Create a new user" : "Edit user"}
      </Typography>

      <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
        Dashboard · User · {mode === "create" ? "Create" : "Edit"}
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="stretch" sx={{ minWidth: 0 }}>
        <Box sx={{ width: { xs: "100%", md: 300 }, flexShrink: 0 }}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ py: 3, display: "flex", flexDirection: "column", height: "100%" }}>
              <Stack alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={value.avatar_url}
                    sx={{
                      width: 84,
                      height: 84,
                    }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // 限制 3MB
                      if (file.size > 3 * 1024 * 1024) {
                        alert("文件大小不能超过 3MB");
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
                        const avatarUrl = await uploadService.uploadAvatar(file);
                        update("avatar_url", avatarUrl);
                      } catch (error) {
                        console.error("上传头像失败:", error);
                        alert(getErrorMessage(error, "上传头像失败，请重试"));
                      } finally {
                        set_uploading(false);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }
                    }}
                  />
                  <IconButton
                    size="small"
                    disabled={uploading}
                    sx={{
                      position: "absolute",
                      right: -6,
                      bottom: -6,
                      bgcolor: "background.paper",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="upload avatar"
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Typography variant="caption" sx={{ opacity: 0.7, textAlign: "center" }}>
                  {uploading ? (
                    "上传中..."
                  ) : (
                    <>
                      Allowed *.jpeg, *.jpg, *.png, *.gif
                      <br />
                      max size of 3 Mb
                    </>
                  )}
                </Typography>

                <Divider sx={{ width: "100%", my: 1 }} />

                <Box sx={{ width: "100%" }}>
                  <Typography fontWeight={800} sx={{ mb: 1 }}>
                    Email verified
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 1.5 }}>
                    Disabling this will automatically send the user a verification email.
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={value.email_verified}
                        onChange={(e) => update("email_verified", e.target.checked)}
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                </Box>

                {props.on_delete && <Box sx={{ flexGrow: 1 }} />}
              </Stack>

              {props.on_delete && (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  fullWidth
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, mt: 2 }}
                  onClick={props.on_delete}
                >
                  Delete user
                </Button>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>

              <Grid container spacing={2.5}>
                {/* Row 1: Name | Email */}
                <Grid item xs={12} md={6}>
                  <TextField label="Name" fullWidth value={value.name} onChange={(e) => update("name", e.target.value)} sx={field_sx} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField label="Email address" fullWidth value={value.email} onChange={(e) => update("email", e.target.value)} sx={field_sx} />
                </Grid>

                {/* Row 2: Phone | Address */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone number"
                    fullWidth
                    value={value.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    sx={field_sx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField label="Address" fullWidth value={value.address} onChange={(e) => update("address", e.target.value)} sx={field_sx} />
                </Grid>

                {/* Row 3: Country | State/region */}
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Country"
                    fullWidth
                    value={value.country}
                    onChange={(e) => update("country", String(e.target.value))}
                    sx={field_sx}
                    SelectProps={{
                      MenuProps: { sx: { "& .MuiPaper-root": { bgcolor: "background.paper" } } },
                      sx: { "& .MuiSelect-select": { color: "rgba(255,255,255,0.9)" } },
                    }}
                  >
                    {country_options.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label} ({c.dial})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField label="State/region" fullWidth value={value.state_region} onChange={(e) => update("state_region", e.target.value)} sx={field_sx} />
                </Grid>

                {/* Row 4: City | Zip/code */}
                <Grid item xs={12} md={6}>
                  <TextField label="City" fullWidth value={value.city} onChange={(e) => update("city", e.target.value)} sx={field_sx} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField label="Zip/code" fullWidth value={value.zip_code} onChange={(e) => update("zip_code", e.target.value)} sx={field_sx} />
                </Grid>

                {/* Row 5: Company | Title/Role */}
                <Grid item xs={12} md={6}>
                  <TextField label="Company" fullWidth value={value.company} onChange={(e) => update("company", e.target.value)} sx={field_sx} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField label="Title / Role" fullWidth value={value.title_role} onChange={(e) => update("title_role", e.target.value)} sx={field_sx} />
                </Grid>

                {/* Permission role：仅当 show_permission_role 为 true 才展示 */}
                {props.show_permission_role ? (
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Permission role"
                      fullWidth
                      value={value.permission_role}
                      onChange={(e) => update("permission_role", e.target.value as user_role)}
                      disabled={!props.allow_edit_permission_role}
                      sx={field_sx}
                      SelectProps={{
                        MenuProps: { sx: { "& .MuiPaper-root": { bgcolor: "background.paper" } } },
                        sx: { "& .MuiSelect-select": { color: "rgba(255,255,255,0.9)" } },
                      }}
                    >
                      <MenuItem value="admin">admin</MenuItem>
                      <MenuItem value="manager">manager</MenuItem>
                      <MenuItem value="user">user</MenuItem>
                    </TextField>
                  </Grid>
                ) : null}

                {/* Status：仅编辑模式显示 */}
                {mode === "edit" && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Status"
                      fullWidth
                      value={value.status ?? "active"}
                      onChange={(e) => update("status", e.target.value as user_status)}
                      sx={field_sx}
                      SelectProps={{
                        MenuProps: { sx: { "& .MuiPaper-root": { bgcolor: "background.paper" } } },
                        sx: { "& .MuiSelect-select": { color: "rgba(255,255,255,0.9)" } },
                      }}
                    >
                      <MenuItem value="active">active</MenuItem>
                      <MenuItem value="pending">pending</MenuItem>
                      <MenuItem value="banned">banned</MenuItem>
                      <MenuItem value="rejected">rejected</MenuItem>
                    </TextField>
                  </Grid>
                )}
              </Grid>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="flex-end"
                alignItems={{ xs: "stretch", sm: "center" }}
                sx={{ mt: 3 }}
              >
                {props.on_cancel ? (
                  <Button
                    variant="outlined"
                    onClick={props.on_cancel}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, width: { xs: "100%", sm: "auto" } }}
                  >
                    Cancel
                  </Button>
                ) : null}
                <Button
                  variant="contained"
                  onClick={() => props.on_submit(value)}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, width: { xs: "100%", sm: "auto" } }}
                >
                  {mode === "create" ? "Create user" : "Save changes"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
}
