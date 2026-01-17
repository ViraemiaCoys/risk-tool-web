import { apiClient } from '@/lib/api-client';

export type PostEntity = {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
};

export type CreatePostDto = {
  content: string;
  image_url?: string;
  user_id: string;
};

export const postsService = {
  // 创建帖子
  async create(data: CreatePostDto): Promise<PostEntity> {
    return apiClient.post<PostEntity>('/posts', data);
  },

  // 获取用户的所有帖子
  async getByUserId(user_id: string): Promise<PostEntity[]> {
    return apiClient.get<PostEntity[]>(`/posts/user/${user_id}`);
  },

  // 获取所有帖子
  async getAll(): Promise<PostEntity[]> {
    return apiClient.get<PostEntity[]>('/posts');
  },

  // 删除帖子
  async delete(id: string, user_id: string): Promise<void> {
    return apiClient.delete<void>(`/posts/${id}?user_id=${user_id}`);
  },
};
