"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";

import { use_auth } from "@/auth/auth.context";
import { can } from "@/auth/rbac";
import { users_mock } from "@/data/user.mock";

// 你自己的表单组件
import UserForm from "@/components/users/UserForm";

export default function UsersEditPage() {
  const params = useParams<{ user_id: string }>();
  const router = useRouter();
  const { me } = use_auth();

  const user_id = params.user_id;

  const target_user = React.useMemo(
    () => users_mock.find((u) => u.user_id === user_id),
    [user_id]
  );

  if (!target_user) {
    return (
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          edit user
        </Typography>
        <Typography sx={{ mt: 1, opacity: 0.8 }}>user not found: {user_id}</Typography>
      </Box>
    );
  }

  const target = { user_id: target_user.user_id, permission_role: target_user.permission_role };
  const allowed = can(me, "user:update", target);

  if (!allowed) {
    return (
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          no permission
        </Typography>
        <Typography sx={{ mt: 1, opacity: 0.8 }}>
          you cannot edit this user.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => router.push("/users")}>
            back to users
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 3 }}>
      <UserForm
        mode="edit"
        user_id={target_user.user_id}
        initial_value={{
          name: target_user.name,
          email: target_user.email,
          title_role: target_user.title_role,
          permission_role: target_user.permission_role,
          status: target_user.status,
          // 其他字段你原本怎么传就怎么补
        }}
      />
    </Box>
  );
}
