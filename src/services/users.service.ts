import { apiClient } from '@/lib/api-client';
import type { user_row } from '@/data/user.mock';

// 与后端 DTO 匹配的类型
export type CreateUserDto = {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  state_region?: string;
  city?: string;
  address?: string;
  zip_code?: string;
  company?: string;
  title_role: string;
  permission_role: 'admin' | 'manager' | 'user';
  status?: 'active' | 'pending' | 'banned' | 'rejected';
  email_verified?: boolean;
  avatar_url?: string;
  cover_url?: string;
  about?: string;
  followers?: string;
  following?: string;
};

export type UpdateUserDto = Partial<CreateUserDto>;

// 后端返回的 User 实体（包含额外字段）
export type UserEntity = user_row & {
  phone?: string;
  country?: string;
  state_region?: string;
  city?: string;
  address?: string;
  zip_code?: string;
  company?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const usersService = {
  // 获取所有用户
  async getAll(): Promise<UserEntity[]> {
    return apiClient.get<UserEntity[]>('/users');
  },

  // 获取单个用户
  async getById(user_id: string): Promise<UserEntity> {
    return apiClient.get<UserEntity>(`/users/${user_id}`);
  },

  // 创建用户
  async create(data: CreateUserDto): Promise<UserEntity> {
    return apiClient.post<UserEntity>('/users', data);
  },

  // 更新用户
  async update(user_id: string, data: UpdateUserDto): Promise<UserEntity> {
    return apiClient.patch<UserEntity>(`/users/${user_id}`, data);
  },

  // 删除用户
  async delete(user_id: string): Promise<void> {
    return apiClient.delete<void>(`/users/${user_id}`);
  },

  // 批量删除用户
  async deleteMany(user_ids: string[]): Promise<void> {
    const idsParam = user_ids.join(',');
    return apiClient.delete<void>(`/users/batch/delete?ids=${idsParam}`);
  },
};
