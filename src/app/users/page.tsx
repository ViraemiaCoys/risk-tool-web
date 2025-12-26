"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

import UserTable from "@/components/UserTable";
import { users_list_rows as dummy_users } from "@/data/user.mock";

type user_status = "all" | "active" | "pending" | "banned" | "rejected";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function UsersListPage() {
  const router = useRouter();

  const [status, set_status] = React.useState<user_status>("all");
  const [role, set_role] = React.useState<string>("all");
  const [query, set_query] = React.useState<string>("");

  // selection（批量选中）
  const [selected_ids, set_selected_ids] = React.useState<string[]>([]);

  const all_roles = React.useMemo(() => {
    const roles = new Set<string>();
    dummy_users.forEach((u: any) => {
      if (u.role) roles.add(String(u.role));
    });
    return ["all", ...Array.from(roles).sort((a, b) => a.localeCompare(b))];
  }, []);

  const counts = React.useMemo(() => {
    const c = { all: 0, active: 0, pending: 0, banned: 0, rejected: 0 };
    dummy_users.forEach((u: any) => {
      c.all += 1;
      const s = normalize(String(u.status || "")) as keyof typeof c;
      if (c[s] !== undefined) c[s] += 1;
    });
    return c;
  }, []);

  const [edit_open, set_edit_open] = React.useState(false);
    const [editing_user, set_editing_user] = React.useState<any | null>(null);

    const open_quick_edit = (row: any) => {
    set_editing_user(row);
    set_edit_open(true);
    };

    const close_quick_edit = () => {
    set_edit_open(false);
    set_editing_user(null);
    };

   const filtered_users = React.useMemo(() => {
    const q = normalize(query);

    return dummy_users
      .filter((u: any) => {
        const matches_status =
          status === "all" ? true : normalize(String(u.status || "")) === status;

        const matches_role =
          role === "all" ? true : normalize(String(u.role || "")) === normalize(role);

        const matches_query =
          q.length === 0
            ? true
            : [u.name, u.email, u.phone, u.company, u.role, u.title]
                .filter(Boolean)
                .some((v) => normalize(String(v)).includes(q));

        return matches_status && matches_role && matches_query;
      })
      .map((u: any, idx: number) => {
        // 关键：给每条记录补一个稳定 id（优先用真实 id，其次 email，最后才 fallback idx）
        const stable_id =
          u.id ?? u.user_id ?? u.uid ?? u.email ?? `${u.name ?? "user"}-${idx}`;

        return { ...u, id: String(stable_id) };
      });
  }, [status, role, query]);

  const has_filters = status !== "all" || role !== "all" || query.trim().length > 0;

  const clear_filters = () => {
    set_status("all");
    set_role("all");
    set_query("");
  };

  const clear_selection = () => set_selected_ids([]);

  // 当筛选变化导致 rows 变化时，清理掉已经不在当前 filtered_users 里的 selection
  React.useEffect(() => {
    const filtered_id_set = new Set(filtered_users.map((u: any) => String(u.id)));
    set_selected_ids((prev) => prev.filter((id) => filtered_id_set.has(id)));
  }, [filtered_users]);

  return (
    <Box>
      {/* 顶部：标题 + Add user */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Users
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            management · user · list
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/users/create")}
        >
          add user
        </Button>
      </Stack>

      {/* Status Tabs */}
      <Tabs
        value={status}
        onChange={(_, v) => set_status(v)}
        sx={{ mb: 1 }}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        <Tab
          value="all"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <span>all</span>
              <Chip size="small" label={counts.all} />
            </Stack>
          }
        />
        <Tab
          value="active"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <span>active</span>
              <Chip size="small" label={counts.active} />
            </Stack>
          }
        />
        <Tab
          value="pending"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <span>pending</span>
              <Chip size="small" label={counts.pending} />
            </Stack>
          }
        />
        <Tab
          value="banned"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <span>banned</span>
              <Chip size="small" label={counts.banned} />
            </Stack>
          }
        />
        <Tab
          value="rejected"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <span>rejected</span>
              <Chip size="small" label={counts.rejected} />
            </Stack>
          }
        />
      </Tabs>

      {/* Filters Row */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Select
          value={role}
          onChange={(e) => set_role(String(e.target.value))}
          size="small"
          sx={{ width: { xs: "100%", md: 240 } }}
        >
          {all_roles.map((r) => (
            <MenuItem key={r} value={r}>
              {r === "all" ? "role (all)" : r}
            </MenuItem>
          ))}
        </Select>

        <TextField
          value={query}
          onChange={(e) => set_query(e.target.value)}
          size="small"
          placeholder="search by name / email / phone / company"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* Active filter chips */}
      {has_filters ? (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {status !== "all" ? (
              <Chip
                label={`status: ${status}`}
                onDelete={() => set_status("all")}
                sx={{ mr: 1, mb: 1 }}
              />
            ) : null}

            {role !== "all" ? (
              <Chip
                label={`role: ${role}`}
                onDelete={() => set_role("all")}
                sx={{ mr: 1, mb: 1 }}
              />
            ) : null}

            {query.trim().length > 0 ? (
              <Chip
                label={`search: ${query}`}
                onDelete={() => set_query("")}
                sx={{ mr: 1, mb: 1 }}
              />
            ) : null}

            <Button variant="text" color="inherit" onClick={clear_filters}>
              clear
            </Button>
          </Stack>
        </Box>
      ) : null}

      <Divider sx={{ mb: 2 }} />

      {/* Table */}
      <UserTable
        rows={filtered_users}
        selected_ids={selected_ids}
        on_change_selected_ids={set_selected_ids}
        on_clear_selection={clear_selection}
      />
    </Box>
  );
}
