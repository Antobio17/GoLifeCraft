import { inject } from "@angular/core";
import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { catchError, throwError } from "rxjs";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(FloatingToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
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
