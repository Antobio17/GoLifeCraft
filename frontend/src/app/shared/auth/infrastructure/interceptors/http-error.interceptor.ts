import { inject } from "@angular/core";
import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { AuthSessionService } from "../../application/services/auth-session.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(FloatingToastService);
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !router.url.startsWith("/login")) {
        authSession.clearSession();
        router.navigate(["/login"]);
      }

      if (error.status !== 401) {
        const errorMessage = error?.error?.errors?.[0];
        toastService.showToast(
          errorMessage ?? {
            status: error.status,
            keyTranslation: "error.server.generic",
            details: [],
          },
        );
      }

      return throwError(() => error);
    }),
  );
};
