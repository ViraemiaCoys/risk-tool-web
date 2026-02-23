const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UploadAvatarResponse {
  avatar_url: string;
}

export interface UploadCoverResponse {
  cover_url: string;
}

export const uploadService = {
  // 上传头像
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/users/upload-avatar`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = '上传失败';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data: UploadAvatarResponse = await response.json();
    // 返回完整 URL
    return `${API_BASE_URL}${data.avatar_url}`;
  },

  // 上传封面图片
  async uploadCover(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/users/upload-cover`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = '上传失败';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data: UploadCoverResponse = await response.json();
    // 返回完整 URL
    return `${API_BASE_URL}${data.cover_url}`;
  },
};
