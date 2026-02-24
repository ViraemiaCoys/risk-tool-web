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
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "@/auth/auth.context";
import type { RegisterDto } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/error-utils";
import type { user_role } from "@/auth/auth.types";

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
  const [selectedRole, setSelectedRole] = React.useState<user_role>("user");
  const [roleMenuAnchor, setRoleMenuAnchor] = React.useState<HTMLElement | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const roles: user_role[] = ["admin", "manager", "user"];

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
        permission_role: selectedRole,
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
                    InputLabelProps={{ shrink: true }}
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
                    InputLabelProps={{ shrink: true }}
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
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "background.default",
                      },
                    }}
                  />

                  {/* 角色选择 */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "text.secondary",
                        fontWeight: 500,
                      }}
                    >
                      选择角色
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<SwapHorizIcon />}
                      onClick={(e) => setRoleMenuAnchor(e.currentTarget)}
                      disabled={loading}
                      sx={{
                        justifyContent: "flex-start",
                        py: 1.5,
                        borderColor: "rgba(255,255,255,0.23)",
                        color: "text.primary",
                        bgcolor: "background.default",
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.4)",
                          bgcolor: "rgba(255,255,255,0.05)",
                        },
                      }}
                    >
                      {selectedRole === "admin" && "👑 "}
                      {selectedRole === "manager" && "🔧 "}
                      {selectedRole === "user" && "👤 "}
                      {selectedRole.toUpperCase()}
                    </Button>
                    <Menu
                      anchorEl={roleMenuAnchor}
                      open={Boolean(roleMenuAnchor)}
                      onClose={() => setRoleMenuAnchor(null)}
                      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                      PaperProps={{
                        sx: {
                          bgcolor: "rgba(20,20,20,0.98)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          borderRadius: 2,
                          minWidth: 180,
                        },
                      }}
                    >
                      <MenuItem
                        disabled
                        sx={{
                          opacity: 0.7,
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        选择角色
                      </MenuItem>
                      {roles.map((role) => (
                        <MenuItem
                          key={role}
                          selected={selectedRole === role}
                          onClick={() => {
                            setSelectedRole(role);
                            setRoleMenuAnchor(null);
                          }}
                          sx={{
                            fontWeight: selectedRole === role ? 800 : 400,
                            bgcolor:
                              selectedRole === role
                                ? "rgba(34, 197, 94, 0.2)"
                                : "transparent",
                          }}
                        >
                          {role === "admin" && "👑 "}
                          {role === "manager" && "🔧 "}
                          {role === "user" && "👤 "}
                          {role.toUpperCase()}
                          {selectedRole === role && " (已选)"}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>

                  <TextField
                    fullWidth
                    label="密码"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange("password")}
                    required
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
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
                    InputLabelProps={{ shrink: true }}
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
