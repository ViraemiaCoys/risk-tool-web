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
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export type quick_company_value = {
  company_code: string;
  company_name: string;
  level: number;
};

const level_options = [
  { value: 1, label: "Level 1 (Top Group)" },
  { value: 2, label: "Level 2 (Sub Group)" },
  { value: 3, label: "Level 3 (Operating Sub)" },
];

export default function CompanyQuickEditDialog(props: {
  open: boolean;
  company: quick_company_value | null;
  on_close: () => void;
  on_submit: (next: quick_company_value) => void;
}) {
  const { open, company } = props;

  const [value, set_value] = React.useState<quick_company_value | null>(company);

  React.useEffect(() => {
    set_value(company);
  }, [company]);

  const update = <K extends keyof quick_company_value>(key: K, next_value: quick_company_value[K]) => {
    set_value((prev) => (prev ? { ...prev, [key]: next_value } : prev));
  };

  const can_submit = Boolean(value?.company_code);

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
              <Grid item xs={12} md={6}>
                <TextField
                  label="Company Name"
                  fullWidth
                  value={value.company_name}
                  onChange={(e) => update("company_name", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Level"
                  fullWidth
                  value={value.level}
                  onChange={(e) => update("level", Number(e.target.value))}
                >
                  {level_options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="flex-end"
              spacing={1.5}
              sx={{ mt: 3 }}
            >
              <Button
                variant="outlined"
                onClick={props.on_close}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, width: { xs: "100%", sm: "auto" } }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!can_submit}
                onClick={() => value && props.on_submit(value)}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, width: { xs: "100%", sm: "auto" } }}
              >
                Update
              </Button>
            </Stack>
          </Box>
        ) : (
          <Typography sx={{ py: 3, opacity: 0.75 }}>No company selected.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
