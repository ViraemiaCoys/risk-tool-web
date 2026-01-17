# 后端联调配置说明

## 配置后端 API 地址

在项目根目录创建或编辑 `.env.local` 文件，设置后端 API 地址：

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

如果你的后端运行在不同的端口或地址，请相应修改。

## API 端点配置

前端已配置以下 API 端点：

### 用户相关 (Users Service)
- `GET /users` - 获取所有用户
- `GET /users/:id` - 获取单个用户详情
- `POST /users` - 创建新用户
- `PATCH /users/:id` - 更新用户信息
- `DELETE /users/:id` - 删除用户
- `DELETE /users/batch/delete?ids=id1,id2,...` - 批量删除用户
- `POST /users/upload-avatar` - 上传头像
- `POST /users/upload-cover` - 上传封面图片

### 帖子相关 (Posts Service)
- `GET /posts` - 获取所有帖子
- `GET /posts/user/:user_id` - 获取指定用户的所有帖子
- `POST /posts` - 创建新帖子
- `DELETE /posts/:id?user_id=xxx` - 删除帖子

## 认证配置

如果后端需要认证 token，可以在浏览器控制台运行：

```javascript
localStorage.setItem('auth_token', '你的token');
// 或
localStorage.setItem('access_token', '你的token');
```

API 客户端会自动在请求头中添加 `Authorization: Bearer {token}`。

## 数据格式

### 创建用户 (CreateUserDto)
```typescript
{
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
}
```

### 创建帖子 (CreatePostDto)
```typescript
{
  content: string;
  image_url?: string;
  user_id: string;
}
```

### 用户实体 (UserEntity)
包含所有 `CreateUserDto` 字段，以及：
- `created_at?: string`
- `updated_at?: string`
- 其他后端返回的字段

### 帖子实体 (PostEntity)
```typescript
{
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}
```

## 错误处理

API 客户端已配置错误处理：
- 自动解析错误消息
- 401 错误会在控制台提示需要登录
- 开发环境下会打印详细的请求和错误日志

## 开发调试

在开发环境下，API 客户端会自动打印所有请求的日志：
- 请求方法 (GET/POST/PATCH/DELETE)
- 请求 URL
- 请求数据 (POST/PATCH)
- 错误信息

## 测试连接

1. 确保后端服务正在运行
2. 在 `.env.local` 中设置正确的 `NEXT_PUBLIC_API_URL`
3. 重启 Next.js 开发服务器 (`npm run dev`)
4. 打开浏览器控制台查看 API 请求日志
5. 访问用户页面测试 API 调用

## 常见问题

### CORS 错误
如果遇到 CORS 错误，需要在后端配置允许前端域名访问。

### 401 未授权
检查后端是否需要认证 token，如果需要，请设置 token（见"认证配置"部分）。

### 404 未找到
确认后端 API 端点路径与前端配置一致。

### 数据类型不匹配
检查后端返回的数据结构是否与前端类型定义一致。
