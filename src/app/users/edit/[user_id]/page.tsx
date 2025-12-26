"use client";

import { useParams, useRouter } from "next/navigation";
import UserForm from "@/components/users/UserForm";
import { users } from "@/data/dummy";

export default function UsersEditPage() {
  const router = useRouter();
  const params = useParams<{ user_id: string }>();
  const user_id = params.user_id;

  const user = users.find((u) => u.user_id === user_id);
  if (!user) return <div>User not found</div>;

  return (
    <UserForm
      mode="edit"
      initial_value={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role,
        country: user.country ?? "us",
        state_region: user.state_region ?? "",
        city: user.city ?? "",
        address: user.address ?? "",
        zip_code: user.zip_code ?? "",
        email_verified: user.email_verified ?? true,
        status: user.status,
      }}
      on_submit={(next_value) => {
        console.log("save user", user_id, next_value);
        router.push("/users");
      }}
      on_cancel={() => router.push("/users")}
      on_delete={() => {
        console.log("delete user", user_id);
        router.push("/users");
      }}
    />
  );
}
