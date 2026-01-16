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

import { use_auth } from "@/auth/auth.context";
import { can } from "@/auth/rbac";

import UserTable from "@/components/UserTable";
import { users_list_rows as dummy_users, type user_row } from "@/data/user.mock";

type user_status = "all" | "active" | "pending" | "banned" | "rejected";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function UsersListPage() {
  const router = useRouter();
  const { me } = use_auth();

  const [status, set_status] = React.useState<user_status>("all");
  const [role, set_role] = React.useState<string>("all"); // 这里 role filter 还是按 title_role/permission_role 都可以，你自己选
  const [query, set_query] = React.useState<string>("");

  const [selected_ids, set_selected_ids] = React.useState<string[]>([]);

  // role filter（这里我用 permission_role 做筛选更合理）
  const all_roles = React.useMemo(() => {
    const roles = new Set<string>();
    dummy_users.forEach((u) => roles.add(String(u.permission_role)));
    return ["all", ...Array.from(roles)];
  }, []);

  const counts = React.useMemo(() => {
    const c = { all: 0, active: 0, pending: 0, banned: 0, rejected: 0 };
    dummy_users.forEach((u) => {
      c.all += 1;
      const s = normalize(String(u.status || "")) as keyof typeof c;
      if (c[s] !== undefined) c[s] += 1;
    });
    return c;
  }, []);

  const filtered_users = React.useMemo(() => {
    const q = normalize(query);

    return dummy_users.filter((u) => {
      const matches_status =
        status === "all" ? true : normalize(String(u.status || "")) === status;

      const matches_role =
        role === "all" ? true : normalize(String(u.permission_role)) === normalize(role);

      const matches_query =
        q.length === 0
          ? true
          : [u.name, u.email, u.phone, u.company, u.title_role, u.permission_role]
              .filter(Boolean)
              .some((v) => normalize(String(v)).includes(q));

      return matches_status && matches_role && matches_query;
    });
  }, [status, role, query]);

  React.useEffect(() => {
    const filtered_id_set = new Set(filtered_users.map((u) => String(u.user_id)));
    set_selected_ids((prev) => prev.filter((id) => filtered_id_set.has(id)));
  }, [filtered_users]);

  const clear_selection = () => set_selected_ids([]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Users
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            management · user · list
          </Typography>
        </Box>

        {/* user 没权限则直接不显示 */}
        {can(me, "user:create") ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/users/create")}
          >
            add user
          </Button>
        ) : null}
      </Stack>

      <Tabs
        value={status}
        onChange={(_, v) => set_status(v)}
        sx={{ mb: 1 }}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        <Tab value="all" label={<Stack direction="row" spacing={1} alignItems="center"><span>all</span><Chip size="small" label={counts.all} /></Stack>} />
        <Tab value="active" label={<Stack direction="row" spacing={1} alignItems="center"><span>active</span><Chip size="small" label={counts.active} /></Stack>} />
        <Tab value="pending" label={<Stack direction="row" spacing={1} alignItems="center"><span>pending</span><Chip size="small" label={counts.pending} /></Stack>} />
        <Tab value="banned" label={<Stack direction="row" spacing={1} alignItems="center"><span>banned</span><Chip size="small" label={counts.banned} /></Stack>} />
        <Tab value="rejected" label={<Stack direction="row" spacing={1} alignItems="center"><span>rejected</span><Chip size="small" label={counts.rejected} /></Stack>} />
      </Tabs>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Select
          value={role}
          onChange={(e) => set_role(String(e.target.value))}
          size="small"
          sx={{ width: { xs: "100%", md: 240 } }}
        >
          {all_roles.map((r) => (
            <MenuItem key={r} value={r}>
              {r === "all" ? "permission (all)" : r}
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

      <Divider sx={{ mb: 2 }} />

      <UserTable
        rows={filtered_users as unknown as user_row[]}
        selected_ids={selected_ids}
        on_change_selected_ids={set_selected_ids}
        on_clear_selection={clear_selection}
      />
    </Box>
  );
}
