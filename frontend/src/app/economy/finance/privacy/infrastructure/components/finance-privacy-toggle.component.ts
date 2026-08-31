import { Component, computed, inject, input } from "@angular/core";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { FinanceAmountPrivacyService } from "@economy/finance/privacy/application/services/finance-amount-privacy.service";

@Component({
  selector: "app-finance-privacy-toggle",
  templateUrl: "./finance-privacy-toggle.component.html",
  imports: [ContextualTranslatePipe, IconButtonComponent],
})
export class FinancePrivacyToggleComponent {
  private privacy = inject(FinanceAmountPrivacyService);

  readonly size = input(40);
  readonly iconSize = input(19);

  readonly icon = computed(() =>
    this.privacy.amountsHidden() ? "eye" : "eyeOff",
  );
  readonly ariaLabelKey = computed(() =>
    this.privacy.amountsHidden()
      ? "financePrivacy.show"
      : "financePrivacy.hide",
  );

  toggle(): void {
    this.privacy.toggle();
  }
}
