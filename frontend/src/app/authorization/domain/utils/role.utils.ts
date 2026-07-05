import { UserRole } from "@authorization/domain/models/user-role.model";
import { USER_ROLES } from "@authorization/domain/constants/user-roles.constants";
import { ROLE_HIERARCHY } from "@authorization/domain/constants/role-hierarchy.constants";

export function getAvailableRoles(withGodRole: boolean = false): UserRole[] {
  const roles: UserRole[] = [USER_ROLES.USER];

  if (withGodRole) {
    roles.unshift(USER_ROLES.GOD);
  }

  return roles;
}

export function isAvailableRole(
  role: string,
  withGodRole: boolean = false,
): boolean {
  return getAvailableRoles(withGodRole).includes(role as UserRole);
}

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

export function getRoleLabelKey(role: string): string {
  if (role === USER_ROLES.GOD) return "user.roles.god";
  if (role === USER_ROLES.USER) return "user.roles.user";

  return role;
}

export function getRoleFullLabelKey(role: string): string {
  if (role === USER_ROLES.GOD) return "user.roles.god";
  if (role === USER_ROLES.USER) return "user.roles.userFull";

  return role;
}

export function getRoleDescriptionKey(role: string): string {
  if (role === USER_ROLES.GOD) return "user.roles.godDescription";
  if (role === USER_ROLES.USER) return "user.roles.userDescription";

  return "";
}

export function getRoleBadgeClass(role: string): string {
  return role === USER_ROLES.GOD ? "badge-god" : "badge-user";
}
