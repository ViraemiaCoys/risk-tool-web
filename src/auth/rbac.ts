import type { me_user, user_role } from "./auth.types";

export type rbac_action =
  | "user:create"
  | "user:update"
  | "user:delete"
  | "user:changeRole"
  | "company:create"
  | "company:update"
  | "company:delete";

export type user_target = {
  user_id: string;
  permission_role: user_role; // 被操作用户的权限
};

export type company_target = {
  company_code: string;
};

export function can(
  me: me_user,
  action: rbac_action,
  target?: user_target | company_target
): boolean {
  const me_role = me.role;

  // Company 权限
  // 创建：admin/manager
  if (action === "company:create") {
    return me_role === "admin" || me_role === "manager";
  }

  // 更新/删除公司
  if (action === "company:update" || action === "company:delete") {
    // user 不能动公司
    if (me_role === "user") return false;
    // admin/manager 可以
    return me_role === "admin" || me_role === "manager";
  }

  // User 权限
  // 创建：admin/manager
  if (action === "user:create") {
    return me_role === "admin" || me_role === "manager";
  }

  // 下面这些要 target
  if (!target || !("user_id" in target)) return false;

  const userTarget = target as user_target;
  const is_self = me.user_id === userTarget.user_id;

  // user 只能改自己
  if (me_role === "user") {
    return action === "user:update" ? is_self : false;
  }

  // manager：能改自己；能增删改 user；不能改权限；不能动 manager/admin
  if (me_role === "manager") {
    if (action === "user:changeRole") return false;
    if (action === "user:update" && is_self) return true;

    if (userTarget.permission_role !== "user") return false;

    if (action === "user:update") return true;
    if (action === "user:delete") return true;

    return false;
  }

  // admin：能增删改 user/manager，能改权限；不删自己，不操作其他 admin
  if (me_role === "admin") {
    if (action === "user:delete" && is_self) return false;

    // 不允许多个 admin 互相操作，要放开也行
    if (userTarget.permission_role === "admin" && !is_self) return false;

    if (action === "user:update") return true;
    if (action === "user:delete") return true;

    if (action === "user:changeRole") {
      return !is_self;
    }

    return false;
  }

  return false;
}
