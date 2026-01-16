"use client";

import * as React from "react";
import {
  Avatar,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LinkIcon from "@mui/icons-material/Link";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";

import { use_auth } from "@/auth/auth.context";
import type { me_user } from "@/auth/auth.types";

type account_tab = "general" | "billing" | "notifications" | "social" | "security";

function tab_label(tab: account_tab) {
  if (tab === "general") return "General";
  if (tab === "billing") return "Billing";
  if (tab === "notifications") return "Notifications";
  if (tab === "social") return "Social links";
  return "Security";
}

function country_label(code: me_user["country_code"]) {
  if (code === "ca") return "🇨🇦 Canada";
  if (code === "us") return "🇺🇸 United States";
  if (code === "uk") return "🇬🇧 United Kingdom";
  return "🇨🇳 China";
}

export default function Page() {
  const { me, patch_me } = use_auth();

  const [tab, set_tab] = React.useState<account_tab>("general");

  // 本地编辑缓冲
  const [value, set_value] = React.useState<me_user>(me);
  const [saving, set_saving] = React.useState(false);

  // toast/snackbar
  const [toast, set_toast] = React.useState<{
    open: boolean;
    severity: "success" | "error" | "warning";
    message: string;
  }>({ open: false, severity: "success", message: "" });

  // 表单错误（目前只做 phone）
  const [errors, set_errors] = React.useState<{ phone?: string }>({});

  React.useEffect(() => {
    set_value(me);
  }, [me]);

  const update = <K extends keyof me_user>(key: K, next: me_user[K]) => {
    set_value((prev) => ({ ...prev, [key]: next }));
  };

  const validate = () => {
    const next_errors: { phone?: string } = {};
    if (!value.phone.trim()) next_errors.phone = "Phone number is required.";
    set_errors(next_errors);
    return Object.keys(next_errors).length === 0;
  };

  const on_save = async () => {
    if (!validate()) {
      set_toast({ open: true, severity: "warning", message: "Please fix the highlighted fields." });
      return;
    }

    set_saving(true);
    try {
      await patch_me({
        name: value.name,
        phone: value.phone,
        address: value.address,
        country_code: value.country_code,
        state_region: value.state_region,
        city: value.city,
        zip_code: value.zip_code,
        about: value.about,
        public_profile: value.public_profile,
        avatar_url: value.avatar_url,
      });

      set_toast({ open: true, severity: "success", message: "Saved successfully." });
      console.log("save account", value);
    } catch (e) {
      console.error(e);
      set_toast({ open: true, severity: "error", message: "Save failed. Check console for details." });
    } finally {
      set_saving(false);
    }
  };

  const on_delete = () => {
    console.log("delete account");
    set_toast({ open: true, severity: "warning", message: "Delete user will be implemented later (admin only)." });
  };

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      {/* title + breadcrumb */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.75 }}>
          Account
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Dashboard &nbsp; • &nbsp; User &nbsp; • &nbsp; Account
        </Typography>
      </Box>

      {/* tabs row */}
      <Box sx={{ mb: 2.5 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => set_tab(v)}
          textColor="inherit"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 800, minHeight: 44 },
          }}
        >
          <Tab
            value="general"
            icon={<SettingsIcon fontSize="small" />}
            iconPosition="start"
            label={tab_label("general")}
          />
          <Tab
            value="billing"
            icon={<CreditCardIcon fontSize="small" />}
            iconPosition="start"
            label={tab_label("billing")}
          />
          <Tab
            value="notifications"
            icon={<NotificationsIcon fontSize="small" />}
            iconPosition="start"
            label={tab_label("notifications")}
          />
          <Tab value="social" icon={<LinkIcon fontSize="small" />} iconPosition="start" label={tab_label("social")} />
          <Tab
            value="security"
            icon={<SecurityIcon fontSize="small" />}
            iconPosition="start"
            label={tab_label("security")}
          />
        </Tabs>
        <Divider sx={{ mt: 1 }} />
      </Box>

      {/* content */}
      {tab === "general" ? (
        <Box
          sx={{
            display: "flex",
            gap: 3,
            alignItems: "flex-start",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {/* left card */}
          <Box sx={{ width: { xs: "100%", sm: 300 }, flex: "0 0 auto" }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ py: 3 }}>
                <Stack alignItems="center" spacing={2}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar src={value.avatar_url} sx={{ width: 84, height: 84 }} />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        right: -6,
                        bottom: -6,
                        bgcolor: "background.paper",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
                      }}
                      onClick={() =>
                        set_toast({ open: true, severity: "warning", message: "Avatar upload will be implemented later." })
                      }
                      aria-label="upload avatar"
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="caption" sx={{ opacity: 0.7, textAlign: "center" }}>
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br />
                    max size of 3 Mb
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={value.public_profile}
                        onChange={(e) => update("public_profile", e.target.checked)}
                      />
                    }
                    label="Public profile"
                  />

                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                    onClick={on_delete}
                  >
                    Delete user
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* right form */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <TextField label="Name" fullWidth value={value.name} onChange={(e) => update("name", e.target.value)} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email address"
                      fullWidth
                      value={value.email}
                      helperText="Email is used as your login account and cannot be edited."
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Phone number"
                      fullWidth
                      value={value.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      error={Boolean(errors.phone)}
                      helperText={errors.phone || " "}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Address"
                      fullWidth
                      value={value.address}
                      onChange={(e) => update("address", e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <Typography variant="caption" sx={{ opacity: 0.7, mb: 0.5 }}>
                        Country
                      </Typography>
                      <Select
                        value={value.country_code}
                        onChange={(e) => update("country_code", e.target.value as me_user["country_code"])}
                      >
                        <MenuItem value="ca">{country_label("ca")}</MenuItem>
                        <MenuItem value="us">{country_label("us")}</MenuItem>
                        <MenuItem value="uk">{country_label("uk")}</MenuItem>
                        <MenuItem value="cn">{country_label("cn")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="State/region"
                      fullWidth
                      value={value.state_region}
                      onChange={(e) => update("state_region", e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField label="City" fullWidth value={value.city} onChange={(e) => update("city", e.target.value)} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Zip/code"
                      fullWidth
                      value={value.zip_code}
                      onChange={(e) => update("zip_code", e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="About"
                      fullWidth
                      multiline
                      minRows={4}
                      value={value.about}
                      onChange={(e) => update("about", e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        variant="contained"
                        disabled={saving}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                        onClick={on_save}
                      >
                        {saving ? "Saving..." : "Save changes"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Box>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography sx={{ fontWeight: 900, fontSize: 18, mb: 1 }}>{tab_label(tab)}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              This tab is a placeholder. You can wire it to real API data later.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* ✅ toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={1800}
        onClose={() => set_toast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => set_toast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ fontWeight: 800 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
