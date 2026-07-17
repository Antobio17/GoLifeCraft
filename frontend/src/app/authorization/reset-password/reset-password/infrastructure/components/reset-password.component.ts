import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { delay } from "rxjs/operators";
import { ResetPasswordService } from "@authorization/reset-password/reset-password/application/services/reset-password.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { AuthCardComponent } from "@shared/design-system/auth-card/infrastructure/components/auth-card.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { PasswordStrengthComponent } from "@shared/design-system/password-strength/infrastructure/components/password-strength.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";

const LOGIN_ROUTE = "/login";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    AuthCardComponent,
    StackComponent,
    FieldComponent,
    TextInputComponent,
    ButtonComponent,
    PasswordStrengthComponent,
    TextComponent,
  ],
})
export class ResetPasswordComponent implements OnInit {
  private resetPasswordService = inject(ResetPasswordService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  token = "";
  password = "";
  confirmPassword = "";
  loading = false;

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get("token") ?? "";

    if (!this.token) {
      this.floatingToastService.showToast({
        status: 400,
        keyTranslation: "resetPassword.error.invalidLink",
        details: [],
      });
    }
  }

  onBackToLogin(): void {
    this.router.navigate([LOGIN_ROUTE]);
  }

  onSubmit(): void {
    if (!this.password || !this.confirmPassword) {
      this.floatingToastService.showToast({
        status: 400,
        keyTranslation: "resetPassword.validation.required",
        details: [],
      });
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.floatingToastService.showToast({
        status: 400,
        keyTranslation: "resetPassword.validation.passwordMismatch",
        details: [],
      });
      return;
    }

    if (!this.token) {
      this.floatingToastService.showToast({
        status: 400,
        keyTranslation: "resetPassword.error.invalidLink",
        details: [],
      });
      return;
    }

    this.loading = true;
    this.resetPasswordService
      .resetPassword(this.token, this.password)
      .pipe(delay(600))
      .subscribe({
        next: () => {
          this.loading = false;
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "resetPassword.success",
            details: [],
          });
          this.router.navigate([LOGIN_ROUTE]);
        },
        error: () => {
          this.loading = false;
          this.floatingToastService.showToast({
            status: 400,
            keyTranslation: "resetPassword.error.generic",
            details: [],
          });
        },
      });
  }
}
