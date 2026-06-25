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
