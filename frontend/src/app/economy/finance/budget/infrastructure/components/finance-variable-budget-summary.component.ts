import { Component, DestroyRef, OnInit, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";
import { GetFinanceBudgetService } from "../../application/services/get-finance-budget.service";
import { FinanceBudgetAttributes } from "../../domain/models/finance-budget-attributes.model";
import { FinanceVariableBudgetCardComponent } from "./finance-variable-budget-card.component";

@Component({
  selector: "app-finance-variable-budget-summary",
  imports: [
    FinanceVariableBudgetCardComponent,
    StackComponent,
    SectionHeaderComponent,
    ContextualTranslatePipe,
  ],
  template: `
    <ds-stack [gap]="'var(--ds-space-2)'">
      <ds-section-header
        [title]="'dashboard.economy.title' | t"
        [actionLabel]="'dashboard.economy.seeAll' | t"
        (action)="openEconomy()"
      />
      <app-finance-variable-budget-card
        [budget]="budget()"
        [budgetLoading]="loading()"
      />
    </ds-stack>
  `,
})
export class FinanceVariableBudgetSummaryComponent implements OnInit {
  private getFinanceBudgetService = inject(GetFinanceBudgetService);
  private router = inject(Router);
  private view = inject(FinanceViewService);
  private destroyRef = inject(DestroyRef);
  readonly loading = signal(true);
  readonly budget = signal<FinanceBudgetAttributes | null>(null);

  openEconomy(): void {
    this.router.navigate(["/economy"]);
  }

  ngOnInit(): void {
    this.getFinanceBudgetService
      .getFinanceBudget(this.view.currentMonth())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.budget.set(response.data.attributes);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
