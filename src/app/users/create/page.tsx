"use client";

import { useRouter } from "next/navigation";
import UserForm, { type user_form_value } from "@/components/users/UserForm";
import RequirePermission from "@/auth/RequirePermission";

export default function UsersCreatePage() {
  const router = useRouter();

  return (
    <RequirePermission action="user:create">
      <UserForm
        mode="create"
        initial_value={{
          perm_role: "user",
        }}
        on_submit={(value: user_form_value) => {
          console.log("create user", value);
          router.push("/users");
        }}
        on_cancel={() => router.push("/users")}
      />
    </RequirePermission>
  );
}
