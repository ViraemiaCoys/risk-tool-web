export type user_role = "admin" | "manager" | "user";

export type me_user = {
  user_id: string;
  name: string;
  email: string;
  role: user_role; // 当前登录用户的权限角色

  phone?: string;
  address?: string;
  country_code?: string;
  state_region?: string;
  city?: string;
  zip_code?: string;
  about?: string;
  public_profile?: boolean;
  avatar_url?: string;
};
