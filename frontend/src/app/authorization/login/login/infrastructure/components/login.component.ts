import { Component, OnInit, inject } from "@angular/core";
import { PerformLoginUseCase } from "@authorization/login/login/application/use-cases/perform-login.use-case";
import { FloatingToastService } from "@shared/shared/floating-toasts/application/services/floating-toast.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { BrandLogoComponent } from "@shared/shared/brand-logo/infrastructure/components/brand-logo.component";

const HOME_ROUTE = "/dashboard";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  imports: [FormsModule, ContextualTranslatePipe, BrandLogoComponent],
})
export class LoginComponent implements OnInit {
  private performLoginUseCase = inject(PerformLoginUseCase);
  private floatingToastService = inject(FloatingToastService);
  private authSessionService = inject(AuthSessionService);
  private router = inject(Router);

  username = "";
  password = "";
  loading = false;
  showPassword = false;

  ngOnInit(): void {
    if (this.authSessionService.isAuthenticated()) {
      this.router.navigate([HOME_ROUTE]);
      return;
    }

    this.authSessionService.clearSession();
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  onRegister(): void {
    this.floatingToastService.showToast({
      status: 200,
      keyTranslation: "login.register.comingSoon",
      details: [],
    });
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.floatingToastService.showToast({
        status: 400,
        keyTranslation: "login.validation.required",
        details: [],
      });
      return;
    }

    this.loading = true;
    this.performLoginUseCase.execute(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate([HOME_ROUTE]);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const errorMessage = err?.error?.errors?.[0];
        this.floatingToastService.showToast(
          errorMessage ?? {
            status: err.status,
            keyTranslation: "login.error.credentials",
            details: [],
          },
        );
      },
    });
  }
}
