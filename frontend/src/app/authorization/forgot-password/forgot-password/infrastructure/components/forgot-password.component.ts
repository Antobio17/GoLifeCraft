import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { delay } from "rxjs/operators";
import { ForgotPasswordService } from "@authorization/forgot-password/forgot-password/application/services/forgot-password.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { AuthCardComponent } from "@shared/design-system/auth-card/infrastructure/components/auth-card.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";

const LOGIN_ROUTE = "/login";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.css"],
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
export class ForgotPasswordComponent {
  private forgotPasswordService = inject(ForgotPasswordService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);

  email = "";
  loading = false;
  submitted = false;

  onBackToLogin(): void {
    this.router.navigate([LOGIN_ROUTE]);
  }

  onSubmit(): void {
    if (!this.email) {
      this.floatingToastService.showToast({
        status: 400,
        keyTranslation: "forgotPassword.validation.required",
        details: [],
      });
      return;
    }

    this.loading = true;
    this.forgotPasswordService
      .requestReset(this.email)
      .pipe(delay(600))
      .subscribe({
        next: () => {
          this.loading = false;
          this.submitted = true;
        },
        error: () => {
          this.loading = false;
          this.submitted = true;
        },
      });
  }
}
