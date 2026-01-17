"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";

import { use_auth } from "@/auth/auth.context";
import { can } from "@/auth/rbac";

import type { user_row } from "@/data/user.mock";
import UserQuickEditDialog, { type quick_user_value } from "@/components/users/UserQuickEditDialog";

function render_status(status: user_row["status"]) {
  if (status === "active") return <Chip label="Active" size="small" color="success" variant="outlined" />;
  if (status === "pending") return <Chip label="Pending" size="small" color="warning" variant="outlined" />;
  if (status === "banned") return <Chip label="Banned" size="small" color="error" variant="outlined" />;
  if (status === "rejected") return <Chip label="Rejected" size="small" color="default" variant="outlined" />;
  return <Chip label="Unknown" size="small" color="default" variant="outlined" />;
}

export default function UserTable(props: {
  rows: user_row[];
  selected_ids: string[];
  on_change_selected_ids: (next: string[]) => void;
  on_clear_selection?: () => void;
}) {
  const router = useRouter();
  const { me } = use_auth();

  const [menu_anchor, set_menu_anchor] = React.useState<null | HTMLElement>(null);
  const [menu_user, set_menu_user] = React.useState<user_row | null>(null);
  const [quick_edit_open, set_quick_edit_open] = React.useState(false);
  const [quick_edit_user, set_quick_edit_user] = React.useState<user_row | null>(null);

  const open_menu = (event: React.MouseEvent<HTMLElement>, row: user_row) => {
    event.stopPropagation();
    set_menu_anchor(event.currentTarget);
    set_menu_user(row);
  };

  const close_menu = () => {
    set_menu_anchor(null);
    set_menu_user(null);
  };

  const open_quick_edit = (row: user_row) => {
    set_quick_edit_user(row);
    set_quick_edit_open(true);
  };

  const close_quick_edit = () => {
    set_quick_edit_open(false);
    set_quick_edit_user(null);
  };

  const go_profile = (row: user_row) => {
    router.push(`/users/profile/${encodeURIComponent(String(row.user_id))}`);
  };

  const go_full_edit = (row: user_row) => {
    router.push(`/users/edit/${encodeURIComponent(String(row.user_id))}`);
  };

  const on_delete = () => {
    if (!menu_user) return;
    console.log("delete user", menu_user.user_id);
    close_menu();
  };

  // selection
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

  return (
    <Box>
      <TableContainer component={Paper} sx={{ overflow: "hidden" }}>
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
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Permission</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>

              <TableCell align="right" sx={{ fontWeight: 700 }}>Edit</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {props.rows.map((row) => {
              const id = String(row.user_id);
              const is_selected = selected_set.has(id);

              const target = { user_id: id, permission_role: row.permission_role };

              const allow_update = can(me, "user:update", target);
              const allow_delete = can(me, "user:delete", target);

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
                  <TableCell>{row.title_role}</TableCell>
                  <TableCell sx={{ textTransform: "lowercase" }}>{row.permission_role}</TableCell>
                  <TableCell>{render_status(row.status)}</TableCell>

                  {/* 只有有权限的用户才显示快速编辑按钮 */}
                  <TableCell align="right">
                    {allow_update ? (
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
                    ) : (
                      <Box sx={{ width: 40, height: 40 }} /> // 占位保持对齐
                    )}
                  </TableCell>

                  {/* 只有有删除或编辑权限的用户才显示Actions菜单 */}
                  <TableCell align="right">
                    {allow_update || allow_delete ? (
                      <Tooltip title="Actions">
                        <IconButton size="small" onClick={(e) => open_menu(e, row)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Box sx={{ width: 40, height: 40 }} /> // 占位保持对齐
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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
        <MenuItem
          disabled={
            !menu_user ||
            !can(me, "user:update", { user_id: String(menu_user.user_id), permission_role: menu_user.permission_role })
          }
          onClick={(e) => {
            e.stopPropagation();
            if (menu_user) go_full_edit(menu_user);
            close_menu();
          }}
        >
          Full edit
        </MenuItem>

        <MenuItem
          disabled={
            !menu_user ||
            !can(me, "user:delete", { user_id: String(menu_user.user_id), permission_role: menu_user.permission_role })
          }
          onClick={(e) => {
            e.stopPropagation();
            on_delete();
          }}
          sx={{ color: "error.main" }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Quick Edit Dialog */}
      <UserQuickEditDialog
        open={quick_edit_open}
        user={
          quick_edit_user
            ? {
                user_id: String(quick_edit_user.user_id),
                name: quick_edit_user.name,
                email: quick_edit_user.email,
                title_role: quick_edit_user.title_role,
                status: quick_edit_user.status ?? "active",
              }
            : null
        }
        on_close={close_quick_edit}
        on_submit={(updated) => {
          console.log("Quick update user", updated);
          // TODO: 这里应该调用API更新用户信息
          close_quick_edit();
        }}
      />
    </Box>
  );
}
