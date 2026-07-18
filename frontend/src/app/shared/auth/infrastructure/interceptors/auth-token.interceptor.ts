import { inject } from "@angular/core";
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { catchError, finalize, shareReplay, switchMap } from "rxjs/operators";
import { AuthSessionService } from "../../application/services/auth-session.service";
import { SessionRefreshService } from "../../application/services/session-refresh.service";
import { AuthSession } from "../../domain/models/auth-session.model";

let refreshInProgress: Observable<AuthSession> | null = null;

const isAuthEndpoint = (url: string): boolean =>
  url.includes("/api/login") || url.includes("/api/token/refresh");

const withToken = (
  req: HttpRequest<unknown>,
  session: AuthSession,
): HttpRequest<unknown> =>
  req.clone({
    setHeaders: { Authorization: `${session.tokenType} ${session.token}` },
  });

const logout = (authSession: AuthSessionService, router: Router): void => {
  authSession.clearSession();
  if (!router.url.startsWith("/login")) {
    router.navigate(["/login"]);
  }
};

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authSession = inject(AuthSessionService);
  const sessionRefresh = inject(SessionRefreshService);
  const router = inject(Router);
  const session = authSession.getSession();

  const authenticatedRequest =
    session?.token && !isAuthEndpoint(req.url) ? withToken(req, session) : req;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthEndpoint(req.url)) {
        return throwError(() => error);
      }

      if (!session?.refreshToken) {
        logout(authSession, router);
        return throwError(() => error);
      }

      if (!refreshInProgress) {
        refreshInProgress = sessionRefresh.refresh().pipe(
          catchError((refreshError) => {
            logout(authSession, router);
            return throwError(() => refreshError);
          }),
          finalize(() => (refreshInProgress = null)),
          shareReplay(1),
        );
      }

      return refreshInProgress.pipe(
        switchMap((refreshedSession) => next(withToken(req, refreshedSession))),
      );
    }),
  );
};
