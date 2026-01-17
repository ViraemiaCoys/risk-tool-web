"use client";

import { useRouter } from "next/navigation";
import { use_auth } from "@/auth/auth.context";
import { can } from "@/auth/rbac";
import UserForm, { type user_form_value } from "@/components/users/UserForm";
import RequirePermission from "@/auth/RequirePermission";

export default function UsersCreatePage() {
  const router = useRouter();
  const { me } = use_auth();

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
        on_submit={(value: user_form_value) => {
          // manager只能创建user角色，即使前端被修改也要确保
          if (me.role === "manager" && value.permission_role !== "user") {
            value.permission_role = "user";
          }
          console.log("create user", value);
          router.push("/users");
        }}
        on_cancel={() => router.push("/users")}
      />
    </RequirePermission>
  );
}
