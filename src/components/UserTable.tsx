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
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";

import { useAuth } from "@/auth/auth.context";
import { can } from "@/auth/rbac";
import { usersService } from "@/services/users.service";

import type { user_row } from "@/data/user.mock";
import UserQuickEditDialog from "@/components/users/UserQuickEditDialog";

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
  on_refresh?: () => void;
}) {
  const router = useRouter();
  const { me } = useAuth();
  const theme = useTheme();
  const is_md_up = useMediaQuery(theme.breakpoints.up("md"));

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

  const on_delete = async () => {
    if (!menu_user) return;
    try {
      await usersService.delete(menu_user.user_id);
      props.on_refresh?.();
      close_menu();
    } catch (error) {
      console.error("删除用户失败:", error);
      alert("删除用户失败，请重试");
    }
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

  const selection_banner = props.selected_ids.length > 0 ? (
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
  ) : null;

  return (
    <Box>
      {is_md_up ? (
        <TableContainer component={Paper} sx={{ overflow: "hidden" }}>
          {selection_banner}

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
                        <Box sx={{ width: 40, height: 40 }} />
                      )}
                    </TableCell>

                    <TableCell align="right">
                      {allow_update || allow_delete ? (
                        <Tooltip title="Actions">
                          <IconButton size="small" onClick={(e) => open_menu(e, row)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Box sx={{ width: 40, height: 40 }} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Stack spacing={1.5}>
          {selection_banner}
          {props.rows.length === 0 ? (
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                暂无用户
              </Typography>
            </Paper>
          ) : (
            props.rows.map((row) => {
              const id = String(row.user_id);
              const is_selected = selected_set.has(id);
              const target = { user_id: id, permission_role: row.permission_role };
              const allow_update = can(me, "user:update", target);
              const allow_delete = can(me, "user:delete", target);

              return (
                <Paper
                  key={id}
                  onClick={() => go_profile(row)}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    border: is_selected
                      ? "1px solid rgba(34,197,94,0.6)"
                      : "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                  }}
                >
                  <Stack spacing={1}>
                    {/* 第一行：勾选 + 姓名邮箱 + 状态 + 操作按钮 */}
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                      justifyContent="space-between"
                      sx={{ gap: 1 }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                        <Checkbox
                          checked={is_selected}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggle_one(id)}
                          sx={{ flexShrink: 0, p: 0.5 }}
                        />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }} noWrap>
                            {row.name}
                          </Typography>
                          <Typography sx={{ opacity: 0.75, fontSize: "0.8rem" }} noWrap>
                            {row.email}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={0.25} alignItems="center" sx={{ flexShrink: 0 }}>
                        {render_status(row.status)}
                        {allow_update && (
                          <Tooltip title="Quick edit">
                            <IconButton
                              size="small"
                              sx={{ p: 0.5 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                open_quick_edit(row);
                              }}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(allow_update || allow_delete) && (
                          <Tooltip title="Actions">
                            <IconButton size="small" sx={{ p: 0.5 }} onClick={(e) => open_menu(e, row)}>
                              <MoreVertIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>
                    {/* 第二行：角色标签（与姓名左对齐） */}
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ pl: 5.5 }}>
                      {row.title_role ? (
                        <Chip label={row.title_role} size="small" sx={{ height: 22, fontSize: "0.7rem" }} />
                      ) : null}
                      <Chip label={row.permission_role} size="small" sx={{ height: 22, fontSize: "0.7rem" }} />
                      {row.company ? (
                        <Chip label={row.company} size="small" sx={{ height: 22, fontSize: "0.7rem" }} />
                      ) : null}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })
          )}
        </Stack>
      )}
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
        on_submit={async (updated) => {
          if (!quick_edit_user) return;
          try {
            await usersService.update(quick_edit_user.user_id, {
              name: updated.name,
              email: updated.email,
              title_role: updated.title_role,
              status: updated.status,
            });
            props.on_refresh?.();
            close_quick_edit();
          } catch (error) {
            console.error("更新用户失败:", error);
            alert("更新用户失败，请重试");
          }
        }}
      />
    </Box>
  );
}
