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
import type { LoginDto } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/error-utils";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = React.useState<LoginDto>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 如果已登录，重定向到首页
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleChange = (field: keyof LoginDto) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(formData);
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err, "登录失败，请检查您的邮箱和密码"));
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
                  登录
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  欢迎回来，请登录您的账户
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

              {/* 登录表单 */}
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="邮箱"
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    required
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
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
                    InputLabelProps={{ shrink: true }}
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
                    {loading ? "登录中..." : "登录"}
                  </Button>
                </Stack>
              </Box>

              {/* 注册链接 */}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  还没有账户？{" "}
                  <Link
                    href="/register"
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    立即注册
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
