import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  output,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { BudgetMeterComponent } from "@shared/design-system/budget-meter/infrastructure/components/budget-meter.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { SkeletonPanelComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-panel.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";
import { GetFinanceBudgetService } from "@economy/finance/budget/application/services/get-finance-budget.service";
import { FinanceBudgetViewService } from "@economy/finance/budget/application/services/finance-budget-view.service";
import { FinanceBudgetAttributes } from "@economy/finance/budget/domain/models/finance-budget-attributes.model";
import { FinanceBudgetStatus } from "@economy/finance/budget/domain/models/finance-budget-status.model";

const MODULE_PATH = "economy/finance/budget";

@Component({
  selector: "app-finance-savings-summary",
  templateUrl: "./finance-savings-summary.component.html",
  imports: [
    RevealDirective,
    ContextualTranslatePipe,
    StackComponent,
    TextComponent,
    HeadingComponent,
    CardComponent,
    ChipComponent,
    BudgetMeterComponent,
    SectionHeaderComponent,
    SkeletonPanelComponent,
  ],
})
export class FinanceSavingsSummaryComponent implements OnInit {
  private translationService = inject(TranslationService);
  private getFinanceBudgetService = inject(GetFinanceBudgetService);
  private budgetView = inject(FinanceBudgetViewService);
  private view = inject(FinanceViewService);
  private destroyRef = inject(DestroyRef);

  readonly seeAll = output<void>();

  loading = signal(true);
  translationsReady = signal(false);
  budget = signal<FinanceBudgetAttributes | null>(null);

  configured = computed(() => this.budget()?.configured ?? false);

  savingsRealLabel = computed(() =>
    this.view.money(this.budget()?.savingsReal ?? 0),
  );
  savingsObjectiveLabel = computed(() =>
    this.view.money(this.budget()?.savingsObjective ?? 0),
  );
  savingsRatio = computed(() => this.budget()?.savingsProgress ?? 0);
  monthProgressRatio = computed(() => this.budget()?.monthProgress ?? 0);
  savingsStatus = computed(
    () => this.budget()?.savingsStatus ?? FinanceBudgetStatus.ON_TRACK,
  );
  savingsTone = computed(() => this.budgetView.tone(this.savingsStatus()));
  savingsBadgeLabel = computed(() => {
    this.translationsReady();

    return this.budgetView.savingsStatusLabel(this.savingsStatus());
  });

  savingsRemaining = computed(
    () =>
      (this.budget()?.savingsObjective ?? 0) -
      (this.budget()?.savingsReal ?? 0),
  );
  savingsGoalReached = computed(() => this.savingsRemaining() <= 0);
  savingsRemainingLabel = computed(() => {
    this.translationsReady();
    const remaining = this.savingsRemaining();

    return this.budgetView.savingsRemainingLabel(
      remaining,
      this.view.money(Math.abs(remaining)),
    );
  });

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(MODULE_PATH)
      .then(() => this.translationsReady.set(true));

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
