import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { delay } from "rxjs/operators";
import { VerifyEmailService } from "@authorization/verify-email/verify-email/application/services/verify-email.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { AuthCardComponent } from "@shared/design-system/auth-card/infrastructure/components/auth-card.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";

const LOGIN_ROUTE = "/login";

type VerificationStatus = "verifying" | "success" | "error";

@Component({
  selector: "app-verify-email",
  templateUrl: "./verify-email.component.html",
  imports: [
    ContextualTranslatePipe,
    AuthCardComponent,
    StackComponent,
    ButtonComponent,
    TextComponent,
  ],
})
export class VerifyEmailComponent implements OnInit {
  private verifyEmailService = inject(VerifyEmailService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  status: VerificationStatus = "verifying";

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get("token") ?? "";

    if (!token) {
      this.status = "error";
      return;
    }

    this.verifyEmailService
      .verify(token)
      .pipe(delay(600))
      .subscribe({
        next: () => {
          this.status = "success";
        },
        error: () => {
          this.status = "error";
        },
      });
  }

  onBackToLogin(): void {
    this.router.navigate([LOGIN_ROUTE]);
  }
}
