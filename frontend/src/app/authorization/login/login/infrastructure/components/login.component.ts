import { Component, OnInit, inject } from "@angular/core";
import { PerformLoginUseCase } from "@authorization/login/login/application/use-cases/perform-login.use-case";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { AuthCardComponent } from "@shared/design-system/auth-card/infrastructure/components/auth-card.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";

const HOME_ROUTE = "/dashboard";
const REGISTER_ROUTE = "/register";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    AuthCardComponent,
    StackComponent,
    FieldComponent,
    TextInputComponent,
    ButtonComponent,
  ],
})
export class LoginComponent implements OnInit {
  private performLoginUseCase = inject(PerformLoginUseCase);
  private floatingToastService = inject(FloatingToastService);
  private authSessionService = inject(AuthSessionService);
  private router = inject(Router);

  email = "";
  password = "";
  loading = false;

  ngOnInit(): void {
    if (this.authSessionService.isAuthenticated()) {
      this.router.navigate([HOME_ROUTE]);
      return;
    }

    this.authSessionService.clearSession();
  }

  onTab(key: string): void {
    if (key !== "register") return;
    this.onRegister();
  }

  onForgot(): void {}

  onRegister(): void {
    this.router.navigate([REGISTER_ROUTE]);
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.floatingToastService.showToast({
        status: 400,
        keyTranslation: "login.validation.required",
        details: [],
      });
      return;
    }

    this.loading = true;
    this.performLoginUseCase.execute(this.email, this.password).subscribe({
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
