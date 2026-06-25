import { inject } from "@angular/core";
import { Router, UrlTree } from "@angular/router";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";

export const authGuard = (): boolean | UrlTree => {
  const authSessionService = inject(AuthSessionService);

  if (authSessionService.isAuthenticated()) {
    return true;
  }

  return inject(Router).createUrlTree(["/login"]);
};
