"use client";

import { useRouter } from "next/navigation";
import UserForm, { type user_form_value } from "@/components/users/UserForm";

export default function UsersCreatePage() {
  const router = useRouter();

  return (
    <UserForm
      mode="create"
      on_submit={(value: user_form_value) => {
        console.log("create user", value);
        router.push("/users");
      }}
      on_cancel={() => router.push("/users")}
    />
  );
}
