import { inject } from "@angular/core";
import { Router, UrlTree } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { SessionRefreshService } from "@shared/auth/application/services/session-refresh.service";

export const authGuard = (): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const authSessionService = inject(AuthSessionService);
  const router = inject(Router);

  if (authSessionService.isAuthenticated()) {
    return true;
  }

  const loginUrlTree = router.createUrlTree(["/login"]);

  if (!authSessionService.getSession()?.refreshToken) {
    return loginUrlTree;
  }

  return inject(SessionRefreshService)
    .refresh()
    .pipe(
      map(() => true),
      catchError(() => of(loginUrlTree)),
    );
};
