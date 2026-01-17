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
  title_role: string;
  status: user_status;
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
              Quick edit common fields. For full details, use &quot;Full edit&quot; from the Actions menu.
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  fullWidth
                  value={value.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Email address"
                  fullWidth
                  value={value.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Title / Role"
                  fullWidth
                  value={value.title_role}
                  onChange={(e) => update("title_role", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
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
              <Button
                variant="outlined"
                onClick={props.on_close}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!can_submit}
                onClick={() => value && props.on_submit(value)}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
              >
                Update
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
