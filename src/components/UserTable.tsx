"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { user_row } from "@/data/dummy";

import {
  Box,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Button,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";

type user_status = "active" | "pending" | "banned" | "rejected";

function render_status(status: user_row["status"]) {
  if (status === "active") {
    return <Chip label="Active" size="small" color="success" variant="outlined" />;
  }
  if (status === "pending") {
    return <Chip label="Pending" size="small" color="warning" variant="outlined" />;
  }
  if (status === "banned") {
    return <Chip label="Banned" size="small" color="error" variant="outlined" />;
  }
  if (status === "rejected") {
    return <Chip label="Rejected" size="small" color="default" variant="outlined" />;
  }
  return <Chip label="Unknown" size="small" color="default" variant="outlined" />;
}

type quick_edit_value = {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  status?: user_status;
};

export default function UserTable(props: {
  rows: user_row[];

  // selection（来自 page.tsx）
  selected_ids: string[];
  on_change_selected_ids: (next: string[]) => void;
  on_clear_selection?: () => void;
}) {
  const router = useRouter();

  /**
   * actions menu（你原来的）
   */
  const [menu_anchor, set_menu_anchor] = React.useState<null | HTMLElement>(null);
  const [menu_user, set_menu_user] = React.useState<user_row | null>(null);

  const open_menu = (event: React.MouseEvent<HTMLElement>, row: user_row) => {
    event.stopPropagation();
    set_menu_anchor(event.currentTarget);
    set_menu_user(row);
  };

  const close_menu = () => {
    set_menu_anchor(null);
    set_menu_user(null);
  };

  const go_profile = (row: user_row) => {
    router.push(`/users/profile/${encodeURIComponent(row.user_id)}`);
  };

  // full edit（保留一个跳转入口，方便你需要全量编辑时用）
  const go_full_edit = (row: user_row) => {
    router.push(`/users/edit/${encodeURIComponent(row.user_id)}`);
  };

  const on_disable = () => {
    if (!menu_user) return;
    console.log("disable user", menu_user.user_id);
    close_menu();
  };

  const on_delete = () => {
    if (!menu_user) return;
    console.log("delete user", menu_user.user_id);
    close_menu();
  };

  /**
   * selection（批量选中）
   */
  const row_ids = React.useMemo(() => props.rows.map((r) => String(r.user_id)), [props.rows]);
  const selected_set = React.useMemo(() => new Set(props.selected_ids), [props.selected_ids]);

  const all_selected = row_ids.length > 0 && row_ids.every((id) => selected_set.has(id));
  const some_selected = row_ids.some((id) => selected_set.has(id)) && !all_selected;

  const toggle_all = (checked: boolean) => {
    if (checked) {
      const merged = Array.from(new Set([...props.selected_ids, ...row_ids]));
      props.on_change_selected_ids(merged);
      return;
    }
    const next = props.selected_ids.filter((id) => !row_ids.includes(id));
    props.on_change_selected_ids(next);
  };

  const toggle_one = (id: string) => {
    if (selected_set.has(id)) {
      props.on_change_selected_ids(props.selected_ids.filter((x) => x !== id));
    } else {
      props.on_change_selected_ids([...props.selected_ids, id]);
    }
  };

  /**
   * quick edit dialog（新增）
   */
  const [quick_open, set_quick_open] = React.useState(false);
  const [quick_value, set_quick_value] = React.useState<quick_edit_value | null>(null);

  const open_quick_edit = (row: user_row) => {
    set_quick_value({
      user_id: String(row.user_id),
      name: String(row.name ?? ""),
      email: String(row.email ?? ""),
      phone: row.phone ? String(row.phone) : "",
      company: row.company ? String(row.company) : "",
      role: row.role ? String(row.role) : "",
      status: (row.status ?? "active") as user_status,
    });
    set_quick_open(true);
  };

  const close_quick_edit = () => {
    set_quick_open(false);
    set_quick_value(null);
  };

  const update_quick = <K extends keyof quick_edit_value>(key: K, next: quick_edit_value[K]) => {
    set_quick_value((prev) => (prev ? { ...prev, [key]: next } : prev));
  };

  const submit_quick = () => {
    if (!quick_value) return;

    // 这里先做 mock：打印并关闭
    // 真正接后端时：在这里调用 PATCH /users/:id，然后刷新列表
    console.log("quick update submit", quick_value);

    close_quick_edit();
  };

  // 可选：让 dialog 更像你截图的暗色
  const dialog_paper_sx = {
    bgcolor: "rgba(20,20,20,0.98)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 3,
  } as const;

  const dialog_field_sx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      backgroundColor: "rgba(255,255,255,0.03)",
      "& fieldset": { borderColor: "rgba(255,255,255,0.18)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.28)" },
      "&.Mui-focused fieldset": { borderColor: "rgba(46, 204, 113, 0.9)" },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.65)" },
    "& .MuiInputBase-input": { color: "rgba(255,255,255,0.92)" },
  } as const;

  return (
    <Box>
      <TableContainer component={Paper} sx={{ overflow: "hidden" }}>
        {/* bulk bar */}
        {props.selected_ids.length > 0 ? (
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: "success.main",
              color: "success.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle2">{props.selected_ids.length} selected</Typography>

            <IconButton size="small" color="inherit" onClick={() => props.on_clear_selection?.()}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : null}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={some_selected}
                  checked={all_selected}
                  onChange={(e) => toggle_all(e.target.checked)}
                />
              </TableCell>

              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Title / Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Edit
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {props.rows.map((row) => {
              const id = String(row.user_id); // 关键：稳定唯一
              const is_selected = selected_set.has(id);

              return (
                <TableRow
                  key={id}
                  hover
                  selected={is_selected}
                  onClick={() => go_profile(row)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={is_selected} onChange={() => toggle_one(id)} />
                  </TableCell>

                  <TableCell sx={{ fontWeight: 650 }}>{row.name}</TableCell>
                  <TableCell sx={{ opacity: 0.85 }}>{row.email}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{render_status(row.status)}</TableCell>

                  {/* Edit：改成打开弹窗 quick edit */}
                  <TableCell align="right">
                    <Tooltip title="Quick edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          open_quick_edit(row);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Actions">
                      <IconButton size="small" onClick={(e) => open_menu(e, row)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* actions menu */}
      <Menu
        anchorEl={menu_anchor}
        open={Boolean(menu_anchor)}
        onClose={close_menu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            bgcolor: "rgba(20,20,20,0.98)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 2,
          },
        }}
      >


        {/* 可选：保留 full edit 跳转 */}
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            if (menu_user) go_full_edit(menu_user);
            close_menu();
          }}
        >
          Full edit
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            on_disable();
          }}
        >
          Disable
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            on_delete();
          }}
          sx={{ color: "error.main" }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* quick edit dialog */}
      <Dialog open={quick_open} onClose={close_quick_edit} maxWidth="md" fullWidth PaperProps={{ sx: dialog_paper_sx }}>
        <DialogTitle sx={{ fontWeight: 900, color: "rgba(255,255,255,0.92)" }}>
          Quick update
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {quick_value ? (
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.75, mb: 2, color: "rgba(255,255,255,0.80)" }}>
                Update common fields quickly. For full details, use “Full edit”.
              </Typography>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.10)", mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Full name"
                    fullWidth
                    value={quick_value.name}
                    onChange={(e) => update_quick("name", e.target.value)}
                    sx={dialog_field_sx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email address"
                    fullWidth
                    value={quick_value.email}
                    onChange={(e) => update_quick("email", e.target.value)}
                    sx={dialog_field_sx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone number"
                    fullWidth
                    value={quick_value.phone ?? ""}
                    onChange={(e) => update_quick("phone", e.target.value)}
                    sx={dialog_field_sx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Company"
                    fullWidth
                    value={quick_value.company ?? ""}
                    onChange={(e) => update_quick("company", e.target.value)}
                    sx={dialog_field_sx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Role"
                    fullWidth
                    value={quick_value.role ?? ""}
                    onChange={(e) => update_quick("role", e.target.value)}
                    sx={dialog_field_sx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5, opacity: 0.75, color: "rgba(255,255,255,0.75)" }}>
                    Status
                  </Typography>

                  <Select
                    fullWidth
                    value={quick_value.status ?? "active"}
                    onChange={(e) => update_quick("status", e.target.value as user_status)}
                    sx={{
                      ...dialog_field_sx,
                      "& .MuiOutlinedInput-root": {
                        ...(dialog_field_sx as any)["& .MuiOutlinedInput-root"],
                      },
                      color: "rgba(255,255,255,0.92)",
                    }}
                  >
                    <MenuItem value="active">active</MenuItem>
                    <MenuItem value="pending">pending</MenuItem>
                    <MenuItem value="banned">banned</MenuItem>
                    <MenuItem value="rejected">rejected</MenuItem>
                  </Select>
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={close_quick_edit}>
                  cancel
                </Button>
                <Button variant="contained" onClick={submit_quick}>
                  update
                </Button>
              </Stack>
            </Box>
          ) : (
            <Typography sx={{ py: 3, opacity: 0.75, color: "rgba(255,255,255,0.80)" }}>
              No user selected.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
