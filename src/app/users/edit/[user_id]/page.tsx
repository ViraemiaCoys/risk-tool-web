"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";

import { useAuth } from "@/auth/auth.context";
import { can } from "@/auth/rbac";
import { useUser } from "@/hooks/use-users";
import { usersService } from "@/services/users.service";
import { getErrorMessage } from "@/lib/error-utils";

// 用户表单
import UserForm, { type user_form_value } from "@/components/users/UserForm";

export default function UsersEditPage() {
  const params = useParams<{ user_id: string }>();
  const router = useRouter();
  const { me } = useAuth();

  const user_id = params.user_id;
  const { user: target_user, loading, error } = useUser(user_id);

  if (loading) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          加载中...
        </Typography>
      </Box>
    );
  }

  if (error || !target_user) {
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
          phone: target_user.phone || "",
          country: target_user.country || "us",
          state_region: target_user.state_region || "",
          city: target_user.city || "",
          address: target_user.address || "",
          zip_code: target_user.zip_code || "",
          company: target_user.company || "",
          title_role: target_user.title_role,
          permission_role: target_user.permission_role,
          status: target_user.status,
          email_verified: target_user.email_verified ?? true,
          avatar_url: target_user.avatar_url || "",
        }}
        show_permission_role={allowed_change_role || me.role === "admin"}
        allow_edit_permission_role={allowed_change_role}
        on_submit={async (value: user_form_value) => {
          try {
            await usersService.update(target_user.user_id, {
              name: value.name,
              email: value.email,
              phone: value.phone || undefined,
              country: value.country || undefined,
              state_region: value.state_region || undefined,
              city: value.city || undefined,
              address: value.address || undefined,
              zip_code: value.zip_code || undefined,
              company: value.company || undefined,
              title_role: value.title_role,
              permission_role: value.permission_role,
              status: value.status || "active",
              email_verified: value.email_verified ?? true,
              avatar_url: value.avatar_url || undefined,
            });
            router.push("/users");
          } catch (error) {
            console.error("更新用户失败:", error);
            alert(getErrorMessage(error, "更新用户失败，请重试"));
          }
        }}
        on_cancel={() => router.push("/users")}
        on_delete={
          can(me, "user:delete", target)
            ? async () => {
                try {
                  await usersService.delete(target_user.user_id);
                  router.push("/users");
                } catch (error) {
                  console.error("删除用户失败:", error);
                  alert("删除用户失败，请重试");
                }
              }
            : undefined
        }
      />
    </Box>
  );
}
