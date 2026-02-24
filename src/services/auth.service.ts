import { apiClient } from '@/lib/api-client';
import type { me_user } from '@/auth/auth.types';

// 登录入参
export type LoginDto = {
  email: string;
  password: string;
};

// 注册入参
export type RegisterDto = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  permission_role?: "admin" | "manager" | "user";
};

// 后端返回：access_token + permission_role
type BackendAuthResponse = {
  access_token: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    permission_role: string;
  };
};

// 登录后给前端的
export type LoginResponse = {
  user: me_user;
  token: string;
};

// 注册后给前端的
export type RegisterResponse = {
  user: me_user;
  token: string;
};

function mapBackendUserToMeUser(backendUser: BackendAuthResponse['user']): me_user {
  const role = (backendUser.permission_role === 'admin' || backendUser.permission_role === 'manager' || backendUser.permission_role === 'user')
    ? backendUser.permission_role
    : 'user';
  return {
    user_id: backendUser.user_id,
    name: backendUser.name,
    email: backendUser.email,
    role,
  };
}

export const authService = {
  // 登录，把后端的 access_token/permission_role 转成 token/role
  async login(data: LoginDto): Promise<LoginResponse> {
    const raw = await apiClient.post<BackendAuthResponse>('/auth/login', data, { skipAuth: true });
    return {
      token: raw.access_token,
      user: mapBackendUserToMeUser(raw.user),
    };
  },

  // 注册
  async register(data: RegisterDto): Promise<RegisterResponse> {
    const raw = await apiClient.post<BackendAuthResponse>('/auth/register', data, { skipAuth: true });
    return {
      token: raw.access_token,
      user: mapBackendUserToMeUser(raw.user),
    };
  },

  // 登出
  async logout(): Promise<void> {
    try {
      await apiClient.post<void>('/auth/logout', undefined);
    } catch (error) {
      // 后端失败也照常清本地 token
      console.warn('登出请求失败，但会清除本地 token:', error);
    }
  },

  // 拿当前用户（校验 token 用）
  async getCurrentUser(): Promise<me_user> {
    return apiClient.get<me_user>('/auth/me');
  },
};
