// 和 auth.context 里的 TOKEN_KEY 保持一致
const AUTH_TOKEN_KEY = 'auth_token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  statusCode?: number;
}

export class ApiClientError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
  }
}

// 带上 token 的请求头，客户端且没 skipAuth 才会加
function getHeaders(skipAuth?: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (!skipAuth && typeof window !== 'undefined') {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
}

// 401 时清掉本地 token，跳去登录页
function handleUnauthorized(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem('risk_tool_me_v1');
  const path = window.location.pathname || '';
  if (!path.includes('/login') && !path.includes('/register')) {
    window.location.href = '/login';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    handleUnauthorized();
    let errorMessage = '未授权，请重新登录';
    try {
      const errorData = await response.clone().json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // 用默认文案
    }
    throw new ApiClientError(errorMessage, 401);
  }

  if (!response.ok) {
    let errorMessage = '请求失败';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiClientError(errorMessage, response.status);
  }

  // 空响应（如 204）直接返回 null
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  return response.json();
}

export type ApiRequestOptions = { skipAuth?: boolean };

export const apiClient = {
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(options?.skipAuth),
    });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(options?.skipAuth),
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(options?.skipAuth),
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(options?.skipAuth),
    });
    return handleResponse<T>(response);
  },
};
