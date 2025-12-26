"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { users } from "@/data/dummy";

export default function UsersEditIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const first = users[0];
    if (first) router.replace(`/users/edit/${first.user_id}`);
  }, [router]);

  return null;
}
