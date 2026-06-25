import { inject } from "@angular/core";
import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { USER_ROLES } from "@authorization/domain/constants/user-roles.constants";

export const blockReadOnlyUserGuard: CanActivateFn = (): boolean | UrlTree => {
  const authSessionService = inject(AuthSessionService);

  if (authSessionService.getCurrentUserRole() !== USER_ROLES.USER) {
    return true;
  }

  return inject(Router).createUrlTree(["/cloud"]);
};
