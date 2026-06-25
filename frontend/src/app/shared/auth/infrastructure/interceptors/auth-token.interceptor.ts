import { inject } from "@angular/core";
import { HttpInterceptorFn } from "@angular/common/http";
import { AuthSessionService } from "../../application/services/auth-session.service";

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authSession = inject(AuthSessionService);
  const session = authSession.getSession();

  if (!session?.token) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `${session.tokenType} ${session.token}` },
    }),
  );
};
