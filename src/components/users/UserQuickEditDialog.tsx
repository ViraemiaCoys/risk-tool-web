"use client";

import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type user_status = "active" | "pending" | "banned" | "rejected";

export type quick_user_value = {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  state_region?: string;
  city?: string;
  address?: string;
  zip_code?: string;
  company?: string;
  role?: string;
  status?: user_status;
};

export default function UserQuickEditDialog(props: {
  open: boolean;
  user: quick_user_value | null;
  on_close: () => void;
  on_submit: (next: quick_user_value) => void;
}) {
  const { open, user } = props;

  const [value, set_value] = React.useState<quick_user_value | null>(user);

  React.useEffect(() => {
    set_value(user);
  }, [user]);

  const update = <K extends keyof quick_user_value>(key: K, next_value: quick_user_value[K]) => {
    set_value((prev) => (prev ? { ...prev, [key]: next_value } : prev));
  };

  const can_submit = Boolean(value?.user_id);

  return (
    <Dialog open={open} onClose={props.on_close} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Quick update</DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {value ? (
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.75, mb: 2 }}>
              Update common fields quickly. For full details, use the full edit page.
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full name"
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
                  value={value.phone ?? ""}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Country"
                  fullWidth
                  value={value.country ?? ""}
                  onChange={(e) => update("country", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="State/region"
                  fullWidth
                  value={value.state_region ?? ""}
                  onChange={(e) => update("state_region", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="City"
                  fullWidth
                  value={value.city ?? ""}
                  onChange={(e) => update("city", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Address"
                  fullWidth
                  value={value.address ?? ""}
                  onChange={(e) => update("address", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Zip/code"
                  fullWidth
                  value={value.zip_code ?? ""}
                  onChange={(e) => update("zip_code", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Company"
                  fullWidth
                  value={value.company ?? ""}
                  onChange={(e) => update("company", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Role"
                  fullWidth
                  value={value.role ?? ""}
                  onChange={(e) => update("role", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, opacity: 0.75 }}>
                  Status
                </Typography>
                <Select
                  fullWidth
                  value={value.status ?? "active"}
                  onChange={(e) => update("status", e.target.value as user_status)}
                >
                  <MenuItem value="active">active</MenuItem>
                  <MenuItem value="pending">pending</MenuItem>
                  <MenuItem value="banned">banned</MenuItem>
                  <MenuItem value="rejected">rejected</MenuItem>
                </Select>
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={props.on_close}>
                cancel
              </Button>
              <Button
                variant="contained"
                disabled={!can_submit}
                onClick={() => value && props.on_submit(value)}
              >
                update
              </Button>
            </Stack>
          </Box>
        ) : (
          <Typography sx={{ py: 3, opacity: 0.75 }}>No user selected.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
