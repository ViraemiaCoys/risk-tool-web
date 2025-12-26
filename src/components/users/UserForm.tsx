"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

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
  role: string;
  email_verified: boolean;
  status?: user_status;
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
  on_submit: (value: user_form_value) => void;
  on_cancel?: () => void;
  on_delete?: () => void;
}) {
  const { mode } = props;

  const [value, set_value] = React.useState<user_form_value>({
    name: "",
    email: "",
    phone: "",
    country: "us",
    state_region: "",
    city: "",
    address: "",
    zip_code: "",
    company: "",
    role: "",
    email_verified: true,
    status: "active",
    ...props.initial_value,
  });

  const update = <K extends keyof user_form_value>(key: K, next_value: user_form_value[K]) => {
    set_value((prev) => ({ ...prev, [key]: next_value }));
  };

  const selected_country =
    country_options.find((c) => c.value === value.country) ?? country_options[0];

  // 统一暗黑输入框样式（注意：类名必须是 Mui 大写）
  const field_sx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      backgroundColor: "rgba(255,255,255,0.03)",
      "& fieldset": { borderColor: "rgba(255,255,255,0.18)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.28)" },
      "&.Mui-focused fieldset": { borderColor: "rgba(46, 204, 113, 0.9)" },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.65)" },
    "& .MuiInputBase-input": { color: "rgba(255,255,255,0.92)" },
    "& .MuiOutlinedInput-notchedOutline": { transition: "border-color 120ms ease" },
  } as const;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
        {mode === "create" ? "Create a new user" : "Edit user"}
      </Typography>

      <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
        Dashboard · User · {mode === "create" ? "Create" : "Edit"}
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="stretch" sx={{ minWidth: 0 }}>
        {/* Left card */}
        <Box sx={{ width: { xs: "100%", md: 280 }, flexShrink: 0 }}>
          <Card sx={{ borderRadius: 3, height: "100%", background: "rgba(255,255,255,0.03)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    sx={{
                      width: 112,
                      height: 112,
                      bgcolor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      right: 6,
                      bottom: 6,
                      bgcolor: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.55)" },
                    }}
                    onClick={() => console.log("upload avatar")}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ textAlign: "center", opacity: 0.65, mb: 2 }}>
                Upload photo
                <br />
                <span style={{ fontSize: 12, opacity: 0.75 }}>
                  allowed *.jpeg, *.jpg, *.png, *.gif
                </span>
              </Typography>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2 }} />

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
            </CardContent>
          </Card>
        </Box>

        {/* Right card */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card sx={{ borderRadius: 3, height: "100%", background: "rgba(255,255,255,0.03)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                Details
              </Typography>

              {/* 桌面端固定两列：md=6 */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Full name"
                    fullWidth
                    value={value.name}
                    onChange={(e) => update("name", e.target.value)}
                    sx={field_sx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email address"
                    fullWidth
                    value={value.email}
                    onChange={(e) => update("email", e.target.value)}
                    sx={field_sx}
                  />
                </Grid>

                {/* Country + Phone 合并：Country 放在 phone 的 startAdornment */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone number"
                    fullWidth
                    value={value.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    sx={field_sx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          <FormControl variant="standard">
                            <Select
                              value={value.country}
                              onChange={(e) => update("country", String(e.target.value))}
                              disableUnderline
                              sx={{
                                minWidth: 120,
                                color: "rgba(255,255,255,0.92)",
                                "& .MuiSelect-select": {
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  py: 0,
                                },
                                "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.55)" },
                              }}
                              renderValue={(selected) => {
                                const c =
                                  country_options.find((x) => x.value === selected) ?? country_options[0];
                                return (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <span>{c.flag}</span>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                      {c.dial}
                                    </Typography>
                                  </Box>
                                );
                              }}
                              MenuProps={{
                                PaperProps: {
                                  sx: {
                                    bgcolor: "rgba(20,20,20,0.98)",
                                    border: "1px solid rgba(255,255,255,0.10)",
                                  },
                                },
                              }}
                            >
                              {country_options.map((c) => (
                                <MenuItem key={c.value} value={c.value}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <span>{c.flag}</span>
                                    <Typography variant="body2">{c.label}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.65 }}>
                                      ({c.dial})
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* 这里放 City，保证同一行还是 2 列 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="City"
                    fullWidth
                    value={value.city}
                    onChange={(e) => update("city", e.target.value)}
                    sx={field_sx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="State/region"
                    fullWidth
                    value={value.state_region}
                    onChange={(e) => update("state_region", e.target.value)}
                    sx={field_sx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Zip/code"
                    fullWidth
                    value={value.zip_code}
                    onChange={(e) => update("zip_code", e.target.value)}
                    sx={field_sx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Address"
                    fullWidth
                    value={value.address}
                    onChange={(e) => update("address", e.target.value)}
                    sx={field_sx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Company"
                    fullWidth
                    value={value.company}
                    onChange={(e) => update("company", e.target.value)}
                    sx={field_sx}
                  />
                </Grid>

                {/* Role 不再超长：保持 md=6 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Role"
                    fullWidth
                    value={value.role}
                    onChange={(e) => update("role", e.target.value)}
                    sx={field_sx}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={props.on_cancel}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={() => props.on_submit(value)}>
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
