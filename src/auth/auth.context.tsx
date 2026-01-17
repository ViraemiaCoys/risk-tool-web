"use client";

import * as React from "react";
import type { me_user } from "./auth.types";
import { me_mock } from "./auth.mock";

const STORAGE_KEY = "risk_tool_me_v1";

type auth_context_value = {
  me: me_user;
  set_me: React.Dispatch<React.SetStateAction<me_user>>;
  patch_me: (patch: Partial<me_user>) => Promise<void>;
  switch_role: (role: me_user["role"]) => void;
};

const AuthContext = React.createContext<auth_context_value | null>(null);

export function AuthProvider(props: { children: React.ReactNode }) {
  // ✅ 首屏必须一致：SSR/CSR 都是 me_mock，防 hydration mismatch
  const [me, set_me] = React.useState<me_user>(me_mock);

  // ✅ 仅客户端挂载后读取缓存
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as me_user;
      if (parsed && parsed.user_id) set_me(parsed);
    } catch {
      // ignore
    }
  }, []);

  // ✅ me 变化就写回缓存
  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(me));
    } catch {
      // ignore
    }
  }, [me]);

  const patch_me = React.useCallback(async (patch: Partial<me_user>) => {
    set_me((prev) => ({ ...prev, ...patch }));
    await new Promise((r) => setTimeout(r, 250));
  }, []);

  const switch_role = React.useCallback((role: me_user["role"]) => {
    set_me((prev) => ({ ...prev, role }));
  }, []);

  const value = React.useMemo(
    () => ({ me, set_me, patch_me, switch_role }),
    [me, patch_me, switch_role]
  );

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function use_auth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("use_auth must be used within <AuthProvider />");
  return ctx;
}
