"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "@/auth/auth.context";
import type { RegisterDto } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/error-utils";

type RegisterFormData = RegisterDto & {
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = React.useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 如果已登录，重定向到首页
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("请输入姓名");
      return false;
    }
    if (!formData.email.trim()) {
      setError("请输入邮箱");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("请输入有效的邮箱地址");
      return false;
    }
    if (!formData.password) {
      setError("请输入密码");
      return false;
    }
    if (formData.password.length < 6) {
      setError("密码长度至少为 6 位");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const registerData: RegisterDto = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone || undefined,
      };
      await register(registerData);
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err, "注册失败，请重试"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        py: 4,
        px: 2,
      }}
    >
      <Box className="app-container" sx={{ width: "100%", maxWidth: 520 }}>
        <Card
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: { xs: "none", sm: "0 20px 60px rgba(0,0,0,0.45)" },
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3}>
              {/* 标题 */}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  注册
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  创建新账户，开始使用我们的服务
                </Typography>
              </Box>

              {/* 错误提示 */}
              {error && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "error.dark",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "error.main",
                  }}
                >
                  <Typography variant="body2" color="error.light">
                    {error}
                  </Typography>
                </Box>
              )}

              {/* 注册表单 */}
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="姓名"
                    value={formData.name}
                    onChange={handleChange("name")}
                    required
                    disabled={loading}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "background.default",
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="邮箱"
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    required
                    disabled={loading}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "background.default",
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="手机号（可选）"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    disabled={loading}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "background.default",
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="密码"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange("password")}
                    required
                    disabled={loading}
                    helperText="密码长度至少为 6 位"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={loading}
                          >
                            {showPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "background.default",
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="确认密码"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    required
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                            disabled={loading}
                          >
                            {showConfirmPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "background.default",
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    {loading ? "注册中..." : "注册"}
                  </Button>
                </Stack>
              </Box>

              {/* 登录链接 */}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  已有账户？{" "}
                  <Link
                    href="/login"
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    立即登录
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
