"use client";

import * as React from "react";
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

type account_tab = "general" | "billing" | "notifications" | "social" | "security";

type me_account = {
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  state_region: string;
  city: string;
  zip_code: string;
  about: string;
  public_profile: boolean;
  avatar_url: string;
};

const me_mock: me_account = {
  name: "Jaydon Frankie",
  email: "demo@minimals.cc",
  phone: "(416) 555-0198",
  address: "90210 Broadway Blvd",
  country: "Canada",
  state_region: "California",
  city: "San Francisco",
  zip_code: "94116",
  about: "Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.",
  public_profile: true,
  avatar_url: "https://i.pravatar.cc/200?img=12",
};

function tab_label(tab: account_tab) {
  if (tab === "general") return "General";
  if (tab === "billing") return "Billing";
  if (tab === "notifications") return "Notifications";
  if (tab === "social") return "Social links";
  return "Security";
}

export default function Page() {
  const [tab, set_tab] = React.useState<account_tab>("general");
  const [value, set_value] = React.useState<me_account>(me_mock);

  const update = <K extends keyof me_account>(key: K, next: me_account[K]) => {
    set_value((prev) => ({ ...prev, [key]: next }));
  };

  const on_save = () => {
    console.log("save account", value);
  };

  const on_delete = () => {
    console.log("delete account");
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
          <Tab
            value="social"
            icon={<LinkIcon fontSize="small" />}
            iconPosition="start"
            label={tab_label("social")}
          />
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
            flexDirection: { xs: "column", sm: "row" }, // xs 上下，sm+ 左右
          }}
        >
          {/* left card */}
          <Box
            sx={{
              width: { xs: "100%", sm: 300 }, // 左侧固定宽度，更像例子
              flex: "0 0 auto",
            }}
          >
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
                      onClick={() => console.log("upload avatar")}
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
                    <TextField
                      label="Name"
                      fullWidth
                      value={value.name}
                      onChange={(e) => update("name", e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email address"
                      fullWidth
                      value={value.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Phone number"
                      fullWidth
                      value={value.phone}
                      onChange={(e) => update("phone", e.target.value)}
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
                    <TextField
                      label="Country"
                      fullWidth
                      value={value.country}
                      onChange={(e) => update("country", e.target.value)}
                    />
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
                    <TextField
                      label="City"
                      fullWidth
                      value={value.city}
                      onChange={(e) => update("city", e.target.value)}
                    />
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
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        variant="contained"
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                        onClick={on_save}
                      >
                        Save changes
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
            <Typography sx={{ fontWeight: 900, fontSize: 18, mb: 1 }}>
              {tab_label(tab)}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              This tab is a placeholder. You can wire it to real API data later.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
