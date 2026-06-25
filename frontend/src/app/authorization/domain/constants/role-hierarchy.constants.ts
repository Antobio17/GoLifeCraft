import { UserRole } from "@authorization/domain/models/user-role.model";
import { USER_ROLES } from "@authorization/domain/constants/user-roles.constants";

export const ROLE_HIERARCHY: UserRole[] = [USER_ROLES.GOD, USER_ROLES.USER];
