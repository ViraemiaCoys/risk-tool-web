"use client";

import * as React from "react";
import type { me_user } from "./auth.types";
import { me_mock } from "./auth.mock";
import { authService, type LoginDto, type RegisterDto } from "@/services/auth.service";

const STORAGE_KEY = "risk_tool_me_v1";
const TOKEN_KEY = "auth_token";

type auth_context_value = {
  me: me_user;
  isAuthenticated: boolean;
  set_me: React.Dispatch<React.SetStateAction<me_user>>;
  patch_me: (patch: Partial<me_user>) => Promise<void>;
  switch_role: (role: me_user["role"]) => void;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<auth_context_value | null>(null);

export function AuthProvider(props: { children: React.ReactNode }) {
  // 首屏统一用 me_mock，避免 SSR/CSR  hydration 对不上
  const [me, set_me] = React.useState<me_user>(me_mock);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // 客户端挂载后读缓存
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const token = window.localStorage.getItem(TOKEN_KEY);
      
      if (raw && token) {
        const parsed = JSON.parse(raw) as me_user;
        // 得有 user_id 和 role 才算有效
        if (parsed && parsed.user_id && parsed.role) {
          set_me(parsed);
          setIsAuthenticated(true);
        } else {
          // 数据残缺就清掉
          window.localStorage.removeItem(STORAGE_KEY);
          window.localStorage.removeItem(TOKEN_KEY);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // me 变了就写回缓存
  React.useEffect(() => {
    try {
      if (isAuthenticated && me.user_id) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(me));
      }
    } catch {
      // ignore
    }
  }, [me, isAuthenticated]);

  const patch_me = React.useCallback(async (patch: Partial<me_user>) => {
    set_me((prev) => ({ ...prev, ...patch }));
    await new Promise((r) => setTimeout(r, 250));
  }, []);

  const switch_role = React.useCallback((role: me_user["role"]) => {
    set_me((prev) => ({ ...prev, role }));
  }, []);

  const login = React.useCallback(async (data: LoginDto) => {
    try {
      const response = await authService.login(data);
      // 存 token
      window.localStorage.setItem(TOKEN_KEY, response.token);
      // 存用户信息，兜底 role
      const user = {
        ...response.user,
        role: (response.user.role || "user") as me_user["role"],
      };
      set_me(user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  }, []);

  const register = React.useCallback(async (data: RegisterDto) => {
    try {
      const response = await authService.register(data);
      // 存 token
      window.localStorage.setItem(TOKEN_KEY, response.token);
      // 存用户信息，兜底 role
      const user = {
        ...response.user,
        role: (response.user.role || "user") as me_user["role"],
      };
      set_me(user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // 就算后端失败也清本地
      console.warn('登出失败:', error);
    } finally {
      // 清掉本地
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(STORAGE_KEY);
      // 重置为初始状态
      set_me(me_mock);
      setIsAuthenticated(false);
    }
  }, []);

  const value = React.useMemo(
    () => ({ 
      me, 
      isAuthenticated, 
      set_me, 
      patch_me, 
      switch_role, 
      login, 
      register, 
      logout 
    }),
    [me, isAuthenticated, patch_me, switch_role, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
