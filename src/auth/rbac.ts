import type { me_user, user_role } from "./auth.types";

export type rbac_action =
  | "user:create"
  | "user:update"
  | "user:delete"
  | "user:changeRole";

export type user_target = {
  user_id: string;
  permission_role: user_role; // 被操作对象的权限角色
};

export function can(me: me_user, action: rbac_action, target?: user_target): boolean {
  const me_role = me.role;

  // create：admin/manager 都可创建（你规则里 manager 也能创建 user）
  if (action === "user:create") {
    return me_role === "admin" || me_role === "manager";
  }

  // update/delete/changeRole 需要 target
  if (!target) return false;

  const is_self = me.user_id === target.user_id;

  // user：只能编辑自己
  if (me_role === "user") {
    return action === "user:update" ? is_self : false;
  }

  // manager：可编辑自身；可增删改 user；不可改权限 role；不可操作 manager/admin
  if (me_role === "manager") {
    if (action === "user:changeRole") return false;
    if (action === "user:update" && is_self) return true;

    if (target.permission_role !== "user") return false;

    if (action === "user:update") return true;
    if (action === "user:delete") return true;

    return false;
  }

  // admin：可增删改 user/manager；可改别人权限；建议：不删自己、不操作其他 admin
  if (me_role === "admin") {
    if (action === "user:delete" && is_self) return false;

    // 不允许 admin 操作其他 admin（更安全；你也可以放开）
    if (target.permission_role === "admin" && !is_self) return false;

    if (action === "user:update") return true;
    if (action === "user:delete") return true;

    if (action === "user:changeRole") {
      return !is_self;
    }

    return false;
  }

  return false;
}
