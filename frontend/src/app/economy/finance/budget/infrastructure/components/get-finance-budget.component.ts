import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { ModuleCardComponent } from "@shared/design-system/module-card/infrastructure/components/module-card.component";
import { ProgressRingComponent } from "@shared/design-system/progress-ring/infrastructure/components/progress-ring.component";
import { DisclosureComponent } from "@shared/design-system/disclosure/infrastructure/components/disclosure.component";
import { BudgetRowComponent } from "@shared/design-system/budget-row/infrastructure/components/budget-row.component";
import { CategoryPillComponent } from "@shared/design-system/category-pill/infrastructure/components/category-pill.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { CtaRowComponent } from "@shared/design-system/cta-row/infrastructure/components/cta-row.component";
import { SkeletonPanelComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-panel.component";
import { SkeletonRowsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-rows.component";
import { SkeletonMetricsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-metrics.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { TransactionRowComponent } from "@shared/design-system/transaction-row/infrastructure/components/transaction-row.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { FinancePrivacyToggleComponent } from "@economy/finance/privacy/infrastructure/components/finance-privacy-toggle.component";
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
import { FinanceBudgetCategoryGroup } from "@economy/finance/budget/domain/models/finance-budget-category-group.model";
import { FinanceBudgetCategoryGroupKey } from "@economy/finance/budget/domain/models/finance-budget-category-group-key.model";
import { FinanceBudgetFixedRow } from "@economy/finance/budget/domain/models/finance-budget-fixed-row.model";
import { FinanceBudgetStatus } from "@economy/finance/budget/domain/models/finance-budget-status.model";
import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";

@Component({
  selector: "app-get-finance-budget",
  templateUrl: "./get-finance-budget.component.html",
  imports: [
    RevealDirective,
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    StackComponent,
    TextComponent,
    HeadingComponent,
    ScreenHeaderComponent,
    IconButtonComponent,
    CardComponent,
    GridComponent,
    ModuleCardComponent,
    ProgressRingComponent,
    DisclosureComponent,
    BudgetRowComponent,
    CategoryPillComponent,
    SectionHeaderComponent,
    EmptyStateComponent,
    ChipComponent,
    CtaRowComponent,
    SkeletonPanelComponent,
    SkeletonRowsComponent,
    SkeletonMetricsComponent,
    SkeletonSectionHeaderComponent,
    TransactionRowComponent,
    FinancePrivacyToggleComponent,
  ],
})
export class GetFinanceBudgetComponent implements OnInit {
  private translationService = inject(TranslationService);
  private backNavigation = inject(BackNavigationService);
  private router = inject(Router);
  private getFinanceBudgetService = inject(GetFinanceBudgetService);
  private getFinanceTransactionsService = inject(GetFinanceTransactionsService);
  protected view = inject(FinanceViewService);
  protected budgetView = inject(FinanceBudgetViewService);
  protected categoryCatalog = inject(FinanceCategoryCatalogService);

  private readonly MODULE_PATH = "economy/finance/budget";
  private categoryTransactionsRequestId = 0;

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

  dayLabel = computed(() => {
    this.translationsReady();
    const attributes = this.budget();

    if (!attributes) return "";

    return this.t("getFinanceBudget.month.day")
      .replace("{day}", `${attributes.dayOfMonth}`)
      .replace("{days}", `${attributes.daysInMonth}`);
  });

  savingsRealLabel = computed(() =>
    this.view.sensitiveMoney(this.budget()?.savingsReal ?? 0),
  );

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
      this.view.sensitiveMoney(Math.abs(remaining)),
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

  variableChipTone = computed(() =>
    this.budgetView.chipTone(this.variableStatus()),
  );
  variablePercent = computed(() => Math.round(this.variableRatio() * 100));
  variablePercentLabel = computed(() =>
    this.budgetView.percentage(this.variableRatio()),
  );
  variableBalance = computed(
    () =>
      (this.budget()?.variableBudget ?? 0) -
      (this.budget()?.variableSpent ?? 0),
  );
  variableOverBudget = computed(() => this.variableBalance() < 0);
  variableBalanceLabel = computed(() => {
    this.translationsReady();
    const balance = this.variableBalance();
    const key =
      balance < 0
        ? "getFinanceBudget.variable.excess"
        : "getFinanceBudget.remaining.left";

    return this.t(key).replace("{amount}", this.view.money(Math.abs(balance)));
  });

  private variableCategories = computed(
    () => this.budget()?.variableCategories ?? [],
  );

  categoryGroups = computed<FinanceBudgetCategoryGroup[]>(() => {
    this.translationsReady();
    const categories = this.variableCategories();

    return [
      this.toCategoryGroup(
        FinanceBudgetCategoryGroupKey.OVER,
        categories
          .filter((category) => category.status === FinanceBudgetStatus.OVER)
          .map((category) => this.toOverCategoryRow(category)),
      ),
      this.toCategoryGroup(
        FinanceBudgetCategoryGroupKey.ACTIVE,
        categories
          .filter(
            (category) =>
              category.status !== FinanceBudgetStatus.OVER &&
              category.spent > 0,
          )
          .map((category) => this.toActiveCategoryRow(category)),
      ),
    ].filter((group) => group.rows.length > 0);
  });

  idleCategoryRows = computed<FinanceBudgetCategoryRow[]>(() => {
    this.translationsReady();

    return this.variableCategories()
      .filter(
        (category) =>
          category.status !== FinanceBudgetStatus.OVER && category.spent <= 0,
      )
      .map((category) => this.toActiveCategoryRow(category));
  });

  selectedGroupKey = computed<FinanceBudgetCategoryGroupKey | null>(() => {
    const selectedCategoryKey = this.selectedCategoryKey();

    if (!selectedCategoryKey) return null;

    return (
      this.categoryGroups().find((group) =>
        group.rows.some((row) => row.key === selectedCategoryKey),
      )?.key ?? null
    );
  });

  idleCountLabel = computed(() => `${this.idleCategoryRows().length}`);

  fixedRows = computed<FinanceBudgetFixedRow[]>(() => {
    this.translationsReady();

    return (this.budget()?.fixedCategories ?? []).map((category) =>
      this.toFixedRow(category),
    );
  });

  fixedSummaryLabel = computed(() => {
    this.translationsReady();
    const rows = this.fixedRows();

    return this.t("getFinanceBudget.fixed.summary")
      .replace("{paid}", `${rows.filter((row) => row.settled).length}`)
      .replace("{total}", `${rows.length}`);
  });

  hasCategories = computed(() => this.variableCategories().length > 0);
  hasIdleCategories = computed(() => this.idleCategoryRows().length > 0);
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
      glyph: this.categoryCatalog.glyph(transaction.category),
      glyphColor: this.categoryCatalog.color(transaction.category),
      title:
        transaction.note || this.categoryCatalog.label(transaction.category),
      subtitle: `${transaction.store || this.categoryCatalog.label(transaction.category)} · ${this.view.dayShortWithWeekday(transaction.transactionDate)}`,
      amountLabel: `−${this.view.money(transaction.amount)}`,
    })),
  );

  ngOnInit(): void {
    Promise.all([
      this.translationService.loadModuleTranslations(this.MODULE_PATH),
      this.categoryCatalog.loadTranslations(),
    ]).then(() => {
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
    this.backNavigation.back(["/economy"]);
  }

  goToSettings(): void {
    this.router.navigate(["/economy/budget/settings"]);
  }

  private toCategoryGroup(
    key: FinanceBudgetCategoryGroupKey,
    rows: FinanceBudgetCategoryRow[],
  ): FinanceBudgetCategoryGroup {
    return {
      key,
      title: this.t(`getFinanceBudget.groups.${key}`),
      countLabel: `${rows.length}`,
      rows,
    };
  }

  private toOverCategoryRow(
    category: FinanceBudgetCategoryProgress,
  ): FinanceBudgetCategoryRow {
    return {
      ...this.toCategoryIdentity(category),
      metaLabel: this.t("getFinanceBudget.category.spentOf")
        .replace("{spent}", this.view.money(category.spent))
        .replace("{budget}", this.view.money(category.budget)),
      amountLabel: "",
      chipLabel: this.t("getFinanceBudget.category.exceeded").replace(
        "{amount}",
        this.view.money(Math.abs(category.remaining)),
      ),
      chipTone: "danger",
      ratio: null,
      tone: this.budgetView.tone(category.status),
    };
  }

  private toActiveCategoryRow(
    category: FinanceBudgetCategoryProgress,
  ): FinanceBudgetCategoryRow {
    const atRisk = category.status === FinanceBudgetStatus.AT_RISK;

    return {
      ...this.toCategoryIdentity(category),
      metaLabel: this.budgetView.remainingLabel(
        category.remaining,
        this.view.money(Math.abs(category.remaining)),
      ),
      amountLabel: this.view.money(category.spent),
      chipLabel: atRisk ? this.budgetView.statusLabel(category.status) : "",
      chipTone: "warning",
      ratio: category.progress,
      tone: this.budgetView.tone(category.status),
    };
  }

  private toCategoryIdentity(
    category: FinanceBudgetCategoryProgress,
  ): Pick<
    FinanceBudgetCategoryRow,
    "key" | "name" | "glyph" | "color" | "budgetLabel" | "paceRatio"
  > {
    return {
      key: category.category,
      name: this.categoryCatalog.label(category.category),
      glyph: this.categoryCatalog.glyph(category.category),
      color: this.categoryCatalog.color(category.category),
      budgetLabel: this.view.money(category.budget),
      paceRatio: this.budget()?.monthProgress ?? 0,
    };
  }

  private toFixedRow(
    category: FinanceBudgetCategoryProgress,
  ): FinanceBudgetFixedRow {
    const settled = category.spent >= category.budget;

    return {
      key: category.category,
      name: this.categoryCatalog.label(category.category),
      glyph: this.categoryCatalog.glyph(category.category),
      color: this.categoryCatalog.color(category.category),
      metaLabel: this.t("getFinanceBudget.fixed.planned").replace(
        "{amount}",
        this.view.money(category.budget),
      ),
      amountLabel: this.view.money(category.spent),
      chipLabel: this.t(
        settled
          ? "getFinanceBudget.fixed.paid"
          : "getFinanceBudget.fixed.pending",
      ),
      chipTone: settled ? "brand" : "neutral",
      settled,
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

          this.selectedCategoryTransactions.set(
            monthlyCategoryExpenseTransactions,
          );
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
