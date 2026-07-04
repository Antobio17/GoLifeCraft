import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { delay } from "rxjs/operators";
import { RegisterService } from "@authorization/register/register/application/services/register.service";
import { FloatingToastService } from "@shared/shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { BrandLogoComponent } from "@shared/shared/brand-logo/infrastructure/components/brand-logo.component";

const LOGIN_ROUTE = "/login";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
  imports: [FormsModule, ContextualTranslatePipe, BrandLogoComponent],
})
export class RegisterComponent {
  private registerService = inject(RegisterService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);

  username = "";
  email = "";
  password = "";
  confirmPassword = "";
  loading = false;
  showPassword = false;

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSignIn(): void {
    this.router.navigate([LOGIN_ROUTE]);
  }

  onSubmit(): void {
    if (
      !this.username ||
      !this.email ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.floatingToastService.showToast({
        status: 400,
        keyTranslation: "register.validation.required",
        details: [],
      });
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.floatingToastService.showToast({
        status: 400,
        keyTranslation: "register.validation.passwordMismatch",
        details: [],
      });
      return;
    }

    this.loading = true;
    this.registerService
      .register({
        username: this.username,
        email: this.email,
        password: this.password,
      })
      .pipe(delay(600))
      .subscribe({
        next: () => {
          this.loading = false;
          this.floatingToastService.showToast({
            status: 201,
            keyTranslation: "register.success",
            details: [],
          });
          this.router.navigate([LOGIN_ROUTE]);
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          const errorMessage = err?.error?.errors?.[0];
          this.floatingToastService.showToast(
            errorMessage ?? {
              status: err.status,
              keyTranslation: "register.error.generic",
              details: [],
            },
          );
        },
      });
  }
}
