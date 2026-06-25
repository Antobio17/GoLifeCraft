import { USER_ROLES } from "@authorization/domain/constants/user-roles.constants";

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
