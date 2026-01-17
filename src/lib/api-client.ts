// API 客户端配置

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

// 获取认证 token（如果存在）
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    // 尝试从 localStorage 获取 token
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
    return token;
  } catch {
    return null;
  }
}

// 构建请求 headers
function getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 如果启用认证且有 token，添加 Authorization header
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = '请求失败';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      
      // 如果是 401 未授权，可能需要重新登录
      if (response.status === 401) {
        console.warn('API 请求未授权，可能需要登录');
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    
    // 在开发环境下打印详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error(`API 错误 [${response.status}]:`, errorMessage);
    }
    
    throw new ApiClientError(errorMessage, response.status);
  }

  // 如果响应是空的（比如 204），返回 null
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  try {
    return await response.json();
  } catch (error) {
    // 如果响应不是 JSON，返回空对象
    console.warn('API 响应不是有效的 JSON');
    return {} as T;
  }
}

export const apiClient = {
  async get<T>(endpoint: string, options?: { skipAuth?: boolean }): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getHeaders(!options?.skipAuth);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API GET] ${url}`);
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data?: unknown, options?: { skipAuth?: boolean }): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getHeaders(!options?.skipAuth);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API POST] ${url}`, data);
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(endpoint: string, data?: unknown, options?: { skipAuth?: boolean }): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getHeaders(!options?.skipAuth);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API PATCH] ${url}`, data);
    }
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string, options?: { skipAuth?: boolean }): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getHeaders(!options?.skipAuth);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API DELETE] ${url}`);
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    return handleResponse<T>(response);
  },
};
