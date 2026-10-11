import { Component, computed, inject, input } from "@angular/core";
import { Router } from "@angular/router";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";
import { FinanceBudgetViewService } from "../../application/services/finance-budget-view.service";
import { FinanceBudgetAttributes } from "../../domain/models/finance-budget-attributes.model";
import { FinanceBudgetStatus } from "../../domain/models/finance-budget-status.model";
import { SkeletonBudgetComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-budget.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { ProgressRingComponent } from "@shared/design-system/progress-ring/infrastructure/components/progress-ring.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { CtaRowComponent } from "@shared/design-system/cta-row/infrastructure/components/cta-row.component";
import {
  ChipComponent,
  ChipTone,
} from "@shared/design-system/chip/infrastructure/components/chip.component";

@Component({
  selector: "app-finance-variable-budget-card",
  templateUrl: "./finance-variable-budget-card.component.html",
  imports: [
    ContextualTranslatePipe,
    SkeletonBudgetComponent,
    CardComponent,
    StackComponent,
    ProgressRingComponent,
    TextComponent,
    HeadingComponent,
    CtaRowComponent,
    ChipComponent,
  ],
})
export class FinanceVariableBudgetCardComponent {
  private view = inject(FinanceViewService);
  private budgetView = inject(FinanceBudgetViewService);
  private router = inject(Router);
  readonly budget = input<FinanceBudgetAttributes | null>(null);
  readonly budgetLoading = input(false);
  budgetConfigured = computed(() => this.budget()?.configured ?? false);
  budgetSpentLabel = computed(() =>
    this.view.money(this.budget()?.variableSpent ?? 0),
  );
  budgetTotalLabel = computed(() =>
    this.view.money(this.budget()?.variableBudget ?? 0),
  );
  budgetPercent = computed(() =>
    Math.round((this.budget()?.variableProgress ?? 0) * 100),
  );
  budgetPercentLabel = computed(() => `${this.budgetPercent()}%`);
  budgetStatus = computed(
    () => this.budget()?.variableStatus ?? FinanceBudgetStatus.ON_TRACK,
  );
  budgetTone = computed(() => this.budgetView.tone(this.budgetStatus()));
  budgetChipTone = computed<ChipTone>(() => {
    const tone = this.budgetTone();

    return tone === "positive" ? "brand" : tone;
  });
  budgetBadgeLabel = computed(
    () => `getFinanceBudget.status.${this.budgetStatus()}`,
  );

  openBudget(): void {
    this.router.navigate(["/economy/budget"]);
  }
  openSettings(): void {
    this.router.navigate(["/economy/budget/settings"]);
  }
}
