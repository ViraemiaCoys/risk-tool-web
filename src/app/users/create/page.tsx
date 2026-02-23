"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/auth.context";
import { usersService } from "@/services/users.service";
import UserForm, { type user_form_value } from "@/components/users/UserForm";
import RequirePermission from "@/auth/RequirePermission";
import { getErrorMessage } from "@/lib/error-utils";

export default function UsersCreatePage() {
  const router = useRouter();
  const { me } = useAuth();

  // admin可以设置任意角色，manager只能创建user角色（且不能修改）
  const can_change_role = me.role === "admin";
  const default_role = "user"; // 默认创建user角色

  return (
    <RequirePermission action="user:create">
      <UserForm
        mode="create"
        initial_value={{
          permission_role: default_role,
        }}
        show_permission_role={can_change_role}
        allow_edit_permission_role={can_change_role}
        on_submit={async (value: user_form_value) => {
          // manager 只能建 user，前端被改也兜底
          if (me.role === "manager" && value.permission_role !== "user") {
            value.permission_role = "user";
          }
          try {
            await usersService.create({
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
              email_verified: value.email_verified ?? false,
              avatar_url: value.avatar_url || undefined,
            });
            router.push("/users");
          } catch (error) {
            console.error("创建用户失败:", error);
            alert(getErrorMessage(error, "创建用户失败，请重试"));
          }
        }}
        on_cancel={() => router.push("/users")}
      />
    </RequirePermission>
  );
}
