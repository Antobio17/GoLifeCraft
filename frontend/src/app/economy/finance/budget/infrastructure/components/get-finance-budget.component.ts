import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { ProgressBarComponent } from "@shared/design-system/progress-bar/infrastructure/components/progress-bar.component";
import { BudgetMeterComponent } from "@shared/design-system/budget-meter/infrastructure/components/budget-meter.component";
import { CtaRowComponent } from "@shared/design-system/cta-row/infrastructure/components/cta-row.component";
import { SkeletonPanelComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-panel.component";
import { SkeletonRowsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-rows.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { TransactionRowComponent } from "@shared/design-system/transaction-row/infrastructure/components/transaction-row.component";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";
import { FinanceCategoryCatalogService } from "@economy/finance/transaction/application/services/finance-category-catalog.service";
import { GetFinanceTransactionsService } from "@economy/finance/transaction/application/services/get-finance-transactions.service";
import { FinanceTransactionKind } from "@economy/finance/transaction/domain/models/finance-transaction-kind.model";
import { FinanceTransactionView } from "@economy/finance/transaction/domain/models/finance-transaction-view.model";
import { GetFinanceBudgetService } from "@economy/finance/budget/application/services/get-finance-budget.service";
import { FinanceBudgetViewService } from "@economy/finance/budget/application/services/finance-budget-view.service";
import { FinanceBudgetAttributes } from "@economy/finance/budget/domain/models/finance-budget-attributes.model";
import { FinanceBudgetCategoryProgress } from "@economy/finance/budget/domain/models/finance-budget-category-progress.model";
import { FinanceBudgetCategoryRow } from "@economy/finance/budget/domain/models/finance-budget-category-row.model";
import { FinanceBudgetFixedRow } from "@economy/finance/budget/domain/models/finance-budget-fixed-row.model";
import { FinanceBudgetStatus } from "@economy/finance/budget/domain/models/finance-budget-status.model";
import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";

@Component({
  selector: "app-get-finance-budget",
  templateUrl: "./get-finance-budget.component.html",
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    StackComponent,
    TextComponent,
    HeadingComponent,
    ScreenHeaderComponent,
    IconButtonComponent,
    CardComponent,
    SectionHeaderComponent,
    EmptyStateComponent,
    EmojiTileComponent,
    ChipComponent,
    ProgressBarComponent,
    BudgetMeterComponent,
    CtaRowComponent,
    SkeletonPanelComponent,
    SkeletonRowsComponent,
    SkeletonSectionHeaderComponent,
    TransactionRowComponent,
  ],
})
export class GetFinanceBudgetComponent implements OnInit {
  private translationService = inject(TranslationService);
  private authSession = inject(AuthSessionService);
  private router = inject(Router);
  private getFinanceBudgetService = inject(GetFinanceBudgetService);
  private getFinanceTransactionsService = inject(GetFinanceTransactionsService);
  protected view = inject(FinanceViewService);
  protected budgetView = inject(FinanceBudgetViewService);
  protected categoryCatalog = inject(FinanceCategoryCatalogService);

  private readonly MODULE_PATH = "economy/finance/budget";
  private categoryTransactionsRequestId = 0;

  canWrite = computed(() => this.authSession.isGod());

  loading = signal(true);
  translationsReady = signal(false);

  month = signal(this.view.currentMonth());
  budget = signal<FinanceBudgetAttributes | null>(null);
  selectedCategoryKey = signal<FinanceCategory | null>(null);
  selectedCategoryTransactions = signal<FinanceTransactionView[]>([]);
  loadingCategoryTransactions = signal(false);

  monthLabel = computed(() => this.view.monthLabel(this.month()));
  canGoNextMonth = computed(
    () => !this.view.isFutureMonth(this.view.shiftMonth(this.month(), 1)),
  );

  configured = computed(() => this.budget()?.configured ?? false);

  monthProgressPercent = computed(() =>
    Math.round((this.budget()?.monthProgress ?? 0) * 100),
  );
  monthProgressLabel = computed(() => `${this.monthProgressPercent()}%`);
  dayLabel = computed(() => {
    this.translationsReady();
    const attributes = this.budget();

    if (!attributes) return "";

    return this.t("getFinanceBudget.month.day")
      .replace("{day}", `${attributes.dayOfMonth}`)
      .replace("{days}", `${attributes.daysInMonth}`);
  });

  savingsRealLabel = computed(() =>
    this.view.money(this.budget()?.savingsReal ?? 0),
  );
  savingsObjectiveLabel = computed(() =>
    this.view.money(this.budget()?.savingsObjective ?? 0),
  );
  savingsRatio = computed(() => this.budget()?.savingsProgress ?? 0);
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

  variableSpentLabel = computed(() =>
    this.view.money(this.budget()?.variableSpent ?? 0),
  );
  variableBudgetLabel = computed(() =>
    this.view.money(this.budget()?.variableBudget ?? 0),
  );
  variableExpectedLabel = computed(() =>
    this.view.money(this.budget()?.variableExpected ?? 0),
  );
  variableRatio = computed(() => this.budget()?.variableProgress ?? 0);
  variableStatus = computed(
    () => this.budget()?.variableStatus ?? FinanceBudgetStatus.ON_TRACK,
  );
  variableTone = computed(() => this.budgetView.tone(this.variableStatus()));
  variableBadgeLabel = computed(() => {
    this.translationsReady();

    return this.budgetView.statusLabel(this.variableStatus());
  });
  variableDifferenceLabel = computed(() => {
    this.translationsReady();
    const difference = this.budget()?.variableDifference ?? 0;

    return this.budgetView.differenceLabel(
      difference,
      this.view.money(Math.abs(difference)),
    );
  });
  variableDifferencePositive = computed(
    () => (this.budget()?.variableDifference ?? 0) >= 0,
  );

  monthProgressRatio = computed(() => this.budget()?.monthProgress ?? 0);

  categoryRows = computed<FinanceBudgetCategoryRow[]>(() => {
    this.translationsReady();

    return (this.budget()?.variableCategories ?? []).map((category) =>
      this.toCategoryRow(category),
    );
  });

  fixedRows = computed<FinanceBudgetFixedRow[]>(() => {
    this.translationsReady();

    return (this.budget()?.fixedCategories ?? []).map((category) =>
      this.toFixedRow(category),
    );
  });

  hasCategories = computed(() => this.categoryRows().length > 0);
  hasFixed = computed(() => this.fixedRows().length > 0);
  hasSelectedCategoryTransactions = computed(
    () => this.selectedCategoryTransactions().length > 0,
  );
  selectedCategoryName = computed(() => {
    const selectedCategoryKey = this.selectedCategoryKey();

    if (!selectedCategoryKey) return "";

    return this.categoryCatalog.label(selectedCategoryKey);
  });
  selectedCategoryTitle = computed(() => {
    this.translationsReady();

    return this.t("getFinanceBudget.categoryMovements.title").replace(
      "{category}",
      this.selectedCategoryName(),
    );
  });
  selectedCategoryRows = computed(() =>
    this.selectedCategoryTransactions().map((transaction) => ({
      id: transaction.id,
      emoji: this.categoryCatalog.emoji(transaction.category),
      title: transaction.note || this.categoryCatalog.label(transaction.category),
      subtitle: `${transaction.store || this.categoryCatalog.label(transaction.category)} · ${this.view.dayShort(transaction.transactionDate)}`,
      amountLabel: `−${this.view.money(transaction.amount)}`,
    })),
  );

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.translationsReady.set(true);
        this.load();
      });
  }

  t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  previousMonth(): void {
    this.month.set(this.view.shiftMonth(this.month(), -1));
    this.clearCategorySelection();
    this.load();
  }

  nextMonth(): void {
    if (!this.canGoNextMonth()) return;

    this.month.set(this.view.shiftMonth(this.month(), 1));
    this.clearCategorySelection();
    this.load();
  }

  selectCategory(categoryKey: FinanceCategory): void {
    if (this.selectedCategoryKey() === categoryKey) {
      this.clearCategorySelection();
      return;
    }

    this.selectedCategoryKey.set(categoryKey);
    this.loadCategoryTransactions(categoryKey);
  }

  clearCategorySelection(): void {
    this.selectedCategoryKey.set(null);
    this.selectedCategoryTransactions.set([]);
    this.loadingCategoryTransactions.set(false);
  }

  goBack(): void {
    this.router.navigate(["/economy"]);
  }

  goToSettings(): void {
    this.router.navigate(["/economy/budget/settings"]);
  }

  private toCategoryRow(
    category: FinanceBudgetCategoryProgress,
  ): FinanceBudgetCategoryRow {
    return {
      key: category.category,
      name: this.categoryCatalog.label(category.category),
      emoji: this.categoryCatalog.emoji(category.category),
      spentLabel: this.view.money(category.spent),
      budgetLabel: this.view.money(category.budget),
      statusText: this.budgetView.differenceLabel(
        category.difference,
        this.view.money(Math.abs(category.difference)),
      ),
      remainLabel: this.budgetView.remainingLabel(
        category.remaining,
        this.view.money(Math.abs(category.remaining)),
      ),
      ratio: category.progress,
      paceRatio: this.budget()?.monthProgress ?? 0,
      tone: this.budgetView.tone(category.status),
    };
  }

  private toFixedRow(
    category: FinanceBudgetCategoryProgress,
  ): FinanceBudgetFixedRow {
    const settled = category.spent >= category.budget;
    const noteKey = settled
      ? "getFinanceBudget.fixed.settled"
      : "getFinanceBudget.fixed.pending";

    return {
      key: category.category,
      name: this.categoryCatalog.label(category.category),
      emoji: this.categoryCatalog.emoji(category.category),
      note: this.t(noteKey).replace(
        "{amount}",
        this.view.money(category.spent),
      ),
      amountLabel: this.view.money(category.budget),
    };
  }

  private load(): void {
    this.loading.set(true);

    this.getFinanceBudgetService.getFinanceBudget(this.month()).subscribe({
      next: (response) => {
        this.budget.set(response.data.attributes);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadCategoryTransactions(categoryKey: FinanceCategory): void {
    const requestId = ++this.categoryTransactionsRequestId;
    this.loadingCategoryTransactions.set(true);
    this.selectedCategoryTransactions.set([]);

    this.getFinanceTransactionsService
      .getFinanceTransactions(this.month())
      .subscribe({
        next: (response) => {
          if (requestId !== this.categoryTransactionsRequestId) return;

          const monthlyCategoryExpenseTransactions =
            response.data.attributes.transactions.filter(
              (transaction) =>
                transaction.kind === FinanceTransactionKind.EXPENSE &&
                transaction.category === categoryKey,
            );

          this.selectedCategoryTransactions.set(monthlyCategoryExpenseTransactions);
          this.loadingCategoryTransactions.set(false);
        },
        error: () => {
          if (requestId !== this.categoryTransactionsRequestId) return;

          this.selectedCategoryTransactions.set([]);
          this.loadingCategoryTransactions.set(false);
        },
      });
  }
}
