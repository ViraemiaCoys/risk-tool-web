"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";

import { use_auth } from "@/auth/auth.context";
import { can } from "@/auth/rbac";
import { users_mock } from "@/data/user.mock";

// 你自己的表单组件
import UserForm, { type user_form_value } from "@/components/users/UserForm";

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
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.03)" }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
              User not found
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              User with ID &quot;{user_id}&quot; does not exist.
            </Typography>
            <Button
              variant="contained"
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
              onClick={() => router.push("/users")}
            >
              Back to users
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const target = { user_id: target_user.user_id, permission_role: target_user.permission_role };
  const allowed_update = can(me, "user:update", target);
  const allowed_change_role = can(me, "user:changeRole", target);

  if (!allowed_update) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.03)" }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
              Access denied
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              You don&apos;t have permission to edit this user.
            </Typography>
            <Button
              variant="contained"
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
              onClick={() => router.push("/users")}
            >
              Back to users
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 3 }}>
      <UserForm
        mode="edit"
        initial_value={{
          name: target_user.name,
          email: target_user.email,
          title_role: target_user.title_role,
          permission_role: target_user.permission_role,
          status: target_user.status,
          // 其他字段你原本怎么传就怎么补
        }}
        show_permission_role={allowed_change_role || me.role === "admin"}
        allow_edit_permission_role={allowed_change_role}
        on_submit={(value: user_form_value) => {
          console.log("update user", value);
          router.push("/users");
        }}
        on_cancel={() => router.push("/users")}
        on_delete={
          can(me, "user:delete", target)
            ? () => {
                console.log("delete user", target_user.user_id);
                router.push("/users");
              }
            : undefined
        }
      />
    </Box>
  );
}
