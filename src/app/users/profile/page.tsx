"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { users_mock } from "@/data/user.mock";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/users/profile/${users_mock[0].user_id}`);
  }, [router]);

  return null;
}
