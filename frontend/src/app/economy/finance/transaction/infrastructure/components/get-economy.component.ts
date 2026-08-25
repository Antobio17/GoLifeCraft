import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { MetricCardComponent } from "@shared/design-system/metric-card/infrastructure/components/metric-card.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { SkeletonPanelComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-panel.component";
import { SkeletonBudgetComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-budget.component";
import { SkeletonMetricsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-metrics.component";
import { SkeletonRowsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-rows.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import { AmountInputComponent } from "@shared/design-system/amount-input/infrastructure/components/amount-input.component";
import { SwipeToDeleteComponent } from "@shared/design-system/swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { TrendBadgeComponent } from "@shared/design-system/trend-badge/infrastructure/components/trend-badge.component";
import { BudgetMeterComponent } from "@shared/design-system/budget-meter/infrastructure/components/budget-meter.component";
import { CtaRowComponent } from "@shared/design-system/cta-row/infrastructure/components/cta-row.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { BalanceCardComponent } from "@shared/design-system/balance-card/infrastructure/components/balance-card.component";
import { BarChartComponent } from "@shared/design-system/bar-chart/infrastructure/components/bar-chart.component";
import { BreakdownRowComponent } from "@shared/design-system/breakdown-row/infrastructure/components/breakdown-row.component";
import { TransactionRowComponent } from "@shared/design-system/transaction-row/infrastructure/components/transaction-row.component";
import { BarChartBar } from "@shared/design-system/bar-chart/domain/models/bar-chart-bar.model";
import {
  CalendarCell,
  CalendarComponent,
} from "@shared/design-system/calendar/infrastructure/components/calendar.component";
import {
  SegmentedOption,
  SegmentedToggleComponent,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import {
  ChoiceChipOption,
  ChoiceChipsComponent,
} from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { GetFinanceOverviewService } from "@economy/finance/transaction/application/services/get-finance-overview.service";
import { GetFinanceTransactionsService } from "@economy/finance/transaction/application/services/get-finance-transactions.service";
import { GetFinanceCalendarService } from "@economy/finance/transaction/application/services/get-finance-calendar.service";
import { CreateFinanceTransactionService } from "@economy/finance/transaction/application/services/create-finance-transaction.service";
import { UpdateFinanceTransactionService } from "@economy/finance/transaction/application/services/update-finance-transaction.service";
import { DeleteFinanceTransactionService } from "@economy/finance/transaction/application/services/delete-finance-transaction.service";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";
import { FinanceCalendarViewService } from "@economy/finance/transaction/application/services/finance-calendar-view.service";
import { FinanceCategoryCatalogService } from "@economy/finance/transaction/application/services/finance-category-catalog.service";
import { FinanceMovementGroupingService } from "@economy/finance/transaction/application/services/finance-movement-grouping.service";
import { FinanceTransactionFormService } from "@economy/finance/transaction/application/services/finance-transaction-form.service";
import { FinanceOverviewAttributes } from "@economy/finance/transaction/domain/models/finance-overview-attributes.model";
import { FinanceCalendarDay } from "@economy/finance/transaction/domain/models/finance-calendar-day.model";
import { FinanceTransactionView } from "@economy/finance/transaction/domain/models/finance-transaction-view.model";
import { FinanceTransactionForm } from "@economy/finance/transaction/domain/models/finance-transaction-form.model";
import { FinanceTransactionKind } from "@economy/finance/transaction/domain/models/finance-transaction-kind.model";
import { FinanceTransactionSource } from "@economy/finance/transaction/domain/models/finance-transaction-source.model";
import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";
import { FinanceMovementRow } from "@economy/finance/transaction/domain/models/finance-movement-row.model";
import { FinanceMovementGroup } from "@economy/finance/transaction/domain/models/finance-movement-group.model";
import { FinanceMovementGrouping } from "@economy/finance/transaction/domain/models/finance-movement-grouping.model";
import { FinanceBreakdownRow } from "@economy/finance/transaction/domain/models/finance-breakdown-row.model";
import { GetFinanceAccountsService } from "@economy/finance/account/application/services/get-finance-accounts.service";
import { FinanceAccountCatalogService } from "@economy/finance/account/application/services/finance-account-catalog.service";
import { FinanceAccount } from "@economy/finance/account/domain/models/finance-account.model";
import { GetFinanceBudgetService } from "@economy/finance/budget/application/services/get-finance-budget.service";
import { FinanceBudgetViewService } from "@economy/finance/budget/application/services/finance-budget-view.service";
import { FinanceBudgetAttributes } from "@economy/finance/budget/domain/models/finance-budget-attributes.model";
import { FinanceBudgetStatus } from "@economy/finance/budget/domain/models/finance-budget-status.model";

const EVOLUTION_MONTHS = 6;

@Component({
  selector: "app-get-economy",
  templateUrl: "./get-economy.component.html",
  styleUrls: ["./get-economy.component.css"],
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    StackComponent,
    TextComponent,
    HeadingComponent,
    ScreenHeaderComponent,
    ButtonComponent,
    IconButtonComponent,
    CardComponent,
    SectionHeaderComponent,
    MetricCardComponent,
    SkeletonListComponent,
    SkeletonComponent,
    SkeletonLineComponent,
    SkeletonPanelComponent,
    SkeletonBudgetComponent,
    SkeletonMetricsComponent,
    SkeletonRowsComponent,
    SkeletonSectionHeaderComponent,
    EmptyStateComponent,
    ModalSheetComponent,
    NoteComponent,
    TextInputComponent,
    DateInputComponent,
    AmountInputComponent,
    SwipeToDeleteComponent,
    TrendBadgeComponent,
    BudgetMeterComponent,
    CtaRowComponent,
    ChipComponent,
    BalanceCardComponent,
    BarChartComponent,
    BreakdownRowComponent,
    TransactionRowComponent,
    CalendarComponent,
    SegmentedToggleComponent,
    ChoiceChipsComponent,
  ],
})
export class GetEconomyComponent implements OnInit {
  private translationService = inject(TranslationService);
  private getFinanceOverviewService = inject(GetFinanceOverviewService);
  private getFinanceTransactionsService = inject(GetFinanceTransactionsService);
  private getFinanceCalendarService = inject(GetFinanceCalendarService);
  private createFinanceTransactionService = inject(
    CreateFinanceTransactionService,
  );
  private updateFinanceTransactionService = inject(
    UpdateFinanceTransactionService,
  );
  private deleteFinanceTransactionService = inject(
    DeleteFinanceTransactionService,
  );
  private getFinanceAccountsService = inject(GetFinanceAccountsService);
  private getFinanceBudgetService = inject(GetFinanceBudgetService);
  private router = inject(Router);
  protected view = inject(FinanceViewService);
  protected budgetView = inject(FinanceBudgetViewService);
  protected calendarView = inject(FinanceCalendarViewService);
  protected categoryCatalog = inject(FinanceCategoryCatalogService);
  protected movementGrouping = inject(FinanceMovementGroupingService);
  protected transactionForm = inject(FinanceTransactionFormService);
  protected accountCatalog = inject(FinanceAccountCatalogService);

  private readonly MODULE_PATH = "economy/finance/transaction";
  private readonly BUDGET_MODULE_PATH = "economy/finance/budget";

  readonly skeletonMovementGroups = [3, 2];

  loading = signal(true);
  budgetLoading = signal(true);
  saving = signal(false);
  translationsReady = signal(false);

  month = signal(this.view.currentMonth());
  overview = signal<FinanceOverviewAttributes | null>(null);
  transactions = signal<FinanceTransactionView[]>([]);
  calendarDays = signal<FinanceCalendarDay[]>([]);
  accounts = signal<FinanceAccount[]>([]);
  budget = signal<FinanceBudgetAttributes | null>(null);

  dayMode = signal(false);
  selectedDate = signal<string | null>(null);
  dayTransactions = signal<FinanceTransactionView[]>([]);
  grouping = signal<FinanceMovementGrouping>(FinanceMovementGrouping.CATEGORY);

  sheetOpen = signal(false);
  editingId = signal<string | null>(null);
  form = signal<FinanceTransactionForm>(
    this.transactionForm.empty(this.view.todayIso(), ""),
  );

  monthLabel = computed(() => this.view.monthLabel(this.month()));
  canGoNextMonth = computed(
    () => !this.view.isFutureMonth(this.view.shiftMonth(this.month(), 1)),
  );

  hasAccounts = computed(() => this.accounts().length > 0);
  hasSeveralAccounts = computed(() => this.accounts().length > 1);
  defaultAccountId = computed(() => this.accounts()[0]?.id ?? "");
  accountOptions = computed<ChoiceChipOption[]>(() =>
    this.accounts().map((account) => ({
      value: account.id,
      label: `${this.accountCatalog.emoji(account.type)} ${account.name}`,
    })),
  );
  accountRows = computed<FinanceBreakdownRow[]>(() => {
    const balances = this.overview()?.accounts ?? [];
    const max = Math.max(...balances.map((item) => Math.abs(item.balance)), 0);

    return balances.map((item) => ({
      key: item.accountId,
      label: `${this.accountCatalog.emoji(item.type)} ${item.name}`,
      amountLabel: this.view.money(item.balance),
      percentageLabel: "",
      emoji: "",
      color: "",
      ratio: this.view.ratio(Math.abs(item.balance), max),
    }));
  });

  hasMovements = computed(() => this.transactions().length > 0);
  hasExpense = computed(() => (this.overview()?.expense ?? 0) > 0);

  budgetConfigured = computed(() => this.budget()?.configured ?? false);
  budgetSpentLabel = computed(() =>
    this.view.money(this.budget()?.variableSpent ?? 0),
  );
  budgetTotalLabel = computed(() =>
    this.view.money(this.budget()?.variableBudget ?? 0),
  );
  budgetExpectedLabel = computed(() =>
    this.view.money(this.budget()?.variableExpected ?? 0),
  );
  budgetRatio = computed(() => this.budget()?.variableProgress ?? 0);
  budgetPaceRatio = computed(() => this.budget()?.monthProgress ?? 0);
  budgetStatus = computed(
    () => this.budget()?.variableStatus ?? FinanceBudgetStatus.ON_TRACK,
  );
  budgetTone = computed(() => this.budgetView.tone(this.budgetStatus()));
  budgetBadgeLabel = computed(() => {
    this.translationsReady();

    return this.budgetView.statusLabel(this.budgetStatus());
  });
  budgetDifferenceLabel = computed(() => {
    this.translationsReady();
    const difference = this.budget()?.variableDifference ?? 0;

    return this.budgetView.differenceLabel(
      difference,
      this.view.money(Math.abs(difference)),
    );
  });
  budgetDifferencePositive = computed(
    () => (this.budget()?.variableDifference ?? 0) >= 0,
  );

  balanceValue = computed(() =>
    this.view.moneyPlain(this.overview()?.balance ?? 0),
  );
  balanceCaption = computed(() => {
    this.translationsReady();
    const delta = this.overview()?.balanceDelta ?? 0;

    return `${this.view.signedMoney(delta)} ${this.t("getEconomy.balance.thisMonth")}`;
  });
  balanceTrendLabel = computed(() =>
    this.view.percentage(this.overview()?.balanceDeltaPercentage ?? 0),
  );
  balancePositive = computed(() => (this.overview()?.balanceDelta ?? 0) >= 0);
  balanceSeries = computed(() =>
    (this.overview()?.series ?? []).map((point) => point.endBalance),
  );
  balanceSeriesLabels = computed(() =>
    (this.overview()?.series ?? []).map((point) =>
      this.view.moneyShort(point.endBalance),
    ),
  );
  balanceSeriesCaptions = computed(() =>
    (this.overview()?.series ?? []).map((point) =>
      this.view.monthShort(point.month),
    ),
  );

  incomeLabel = computed(() => this.view.money(this.overview()?.income ?? 0));
  expenseLabel = computed(() =>
    this.view.negativeMoney(this.overview()?.expense ?? 0),
  );
  netLabel = computed(() => this.view.signedMoney(this.overview()?.net ?? 0));

  evolutionBars = computed<BarChartBar[]>(() =>
    (this.overview()?.series ?? []).slice(-EVOLUTION_MONTHS).map((point) => ({
      label: this.view.monthShort(point.month),
      value: point.expense,
      valueLabel: this.view.money(point.expense),
      selected: point.month === this.month(),
    })),
  );
  evolutionDeltaLabel = computed(() => {
    const delta = this.overview()?.expenseDeltaPercentage;

    return delta === null || delta === undefined
      ? "—"
      : this.view.percentage(delta);
  });
  evolutionDeltaPositive = computed(() => {
    const delta = this.overview()?.expenseDeltaPercentage;

    return delta === null || delta === undefined ? true : delta <= 0;
  });

  overspending = computed(() => this.overview()?.overspending ?? false);
  overspendingText = computed(() => {
    this.translationsReady();
    const attributes = this.overview();

    if (!attributes) return "";

    return this.t("getEconomy.overspending.text")
      .replace("{expense}", this.view.money(attributes.expense))
      .replace(
        "{percentage}",
        `${Math.round(attributes.overspendingPercentage)}`,
      )
      .replace("{average}", this.view.money(attributes.averageExpense));
  });

  categoryRows = computed<FinanceBreakdownRow[]>(() => {
    this.translationsReady();
    const totals = this.overview()?.byCategory ?? [];
    const max = Math.max(...totals.map((total) => total.amount), 0);

    return totals.map((total) => ({
      key: total.category,
      label: this.categoryCatalog.label(total.category),
      amountLabel: this.view.money(total.amount),
      percentageLabel: `${Math.round(total.percentage)}%`,
      emoji: this.categoryCatalog.emoji(total.category),
      color: this.categoryCatalog.color(total.category),
      ratio: this.view.ratio(total.amount, max),
    }));
  });

  storeRows = computed<FinanceBreakdownRow[]>(() => {
    const totals = this.overview()?.byStore ?? [];
    const max = Math.max(...totals.map((total) => total.amount), 0);

    return totals.map((total) => ({
      key: total.store,
      label: total.store,
      amountLabel: this.view.money(total.amount),
      percentageLabel: "",
      emoji: "",
      color: "",
      ratio: this.view.ratio(total.amount, max),
    }));
  });

  movementRows = computed<FinanceMovementRow[]>(() =>
    this.toRows(this.transactions()),
  );
  dayMovementRows = computed<FinanceMovementRow[]>(() =>
    this.toRows(this.dayTransactions()),
  );
  movementGroups = computed<FinanceMovementGroup[]>(() =>
    this.movementGrouping.group(this.movementRows(), this.grouping()),
  );
  groupingOptions = computed<SegmentedOption[]>(() => {
    this.translationsReady();

    return [
      {
        value: FinanceMovementGrouping.CATEGORY,
        label: this.t("getEconomy.grouping.category"),
      },
      {
        value: FinanceMovementGrouping.DATE,
        label: this.t("getEconomy.grouping.date"),
      },
    ];
  });
  movementsCountLabel = computed(() => {
    this.translationsReady();
    const count = this.transactions().length;
    const unit = this.t(
      count === 1 ? "getEconomy.movements.one" : "getEconomy.movements.many",
    );

    return `${count} ${unit}`;
  });

  calendarWeekdays = computed(() => this.calendarView.weekdays());
  calendarCells = computed<CalendarCell[]>(() =>
    this.calendarView.buildCells(
      this.month(),
      this.calendarDays(),
      this.selectedDate(),
      this.view.todayIso(),
    ),
  );

  dayTitle = computed(() => {
    const date = this.selectedDate();

    return date ? this.view.dayLong(date) : "";
  });
  dayExpenseLabel = computed(() =>
    this.view.money(
      this.dayTransactions()
        .filter(
          (transaction) => transaction.kind === FinanceTransactionKind.EXPENSE,
        )
        .reduce((total, transaction) => total + transaction.amount, 0),
    ),
  );
  dayIncomeTotal = computed(() =>
    this.dayTransactions()
      .filter(
        (transaction) => transaction.kind === FinanceTransactionKind.INCOME,
      )
      .reduce((total, transaction) => total + transaction.amount, 0),
  );
  dayIncomeLabel = computed(() => this.view.money(this.dayIncomeTotal()));
  dayHasIncome = computed(() => this.dayIncomeTotal() > 0);

  kindOptions = computed<SegmentedOption[]>(() => {
    this.translationsReady();

    return [
      {
        value: FinanceTransactionKind.EXPENSE,
        label: this.t("getEconomy.kind.expense"),
      },
      {
        value: FinanceTransactionKind.INCOME,
        label: this.t("getEconomy.kind.income"),
      },
    ];
  });
  categoryOptions = computed<ChoiceChipOption[]>(() => {
    this.translationsReady();

    return this.categoryCatalog.chipOptions();
  });

  isIncomeForm = computed(
    () => this.form().kind === FinanceTransactionKind.INCOME,
  );
  sheetTitle = computed(() =>
    this.isIncomeForm()
      ? "getEconomy.sheet.incomeTitle"
      : "getEconomy.sheet.expenseTitle",
  );
  noteLabel = computed(() =>
    this.isIncomeForm()
      ? "getEconomy.sheet.conceptLabel"
      : "getEconomy.sheet.noteLabel",
  );
  notePlaceholder = computed(() =>
    this.isIncomeForm()
      ? "getEconomy.sheet.conceptPlaceholder"
      : "getEconomy.sheet.notePlaceholder",
  );
  storeLabel = computed(() =>
    this.isIncomeForm()
      ? "getEconomy.sheet.originLabel"
      : "getEconomy.sheet.storeLabel",
  );
  saveLabel = computed(() =>
    this.isIncomeForm()
      ? "getEconomy.sheet.saveIncome"
      : "getEconomy.sheet.saveExpense",
  );
  formValid = computed(() => this.transactionForm.isValid(this.form()));

  ngOnInit(): void {
    Promise.all([
      this.translationService.loadModuleTranslations(this.MODULE_PATH),
      this.translationService.loadModuleTranslations(this.BUDGET_MODULE_PATH),
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
    this.clearDay();
    this.load();
  }

  nextMonth(): void {
    if (!this.canGoNextMonth()) return;

    this.month.set(this.view.shiftMonth(this.month(), 1));
    this.clearDay();
    this.load();
  }

  toggleDayMode(): void {
    this.dayMode.update((mode) => !mode);
  }

  onGrouping(grouping: string): void {
    this.grouping.set(grouping as FinanceMovementGrouping);
  }

  onCalendarDay(date: string): void {
    this.selectedDate.set(date);
    this.loadDay(date);
  }

  clearDay(): void {
    this.selectedDate.set(null);
    this.dayTransactions.set([]);
  }

  goToAccounts(): void {
    this.router.navigate(["/economy/accounts"]);
  }

  goToRecurrences(): void {
    this.router.navigate(["/economy/recurrences"]);
  }

  goToBudget(): void {
    this.router.navigate(["/economy/budget"]);
  }

  goToBudgetSettings(): void {
    this.router.navigate(["/economy/budget/settings"]);
  }

  openNewSheet(): void {
    this.editingId.set(null);
    this.form.set(
      this.transactionForm.empty(
        this.selectedDate() ?? this.view.todayIso(),
        this.defaultAccountId(),
      ),
    );
    this.sheetOpen.set(true);
  }

  openEditSheet(transaction: FinanceTransactionView): void {
    this.editingId.set(transaction.id);
    this.form.set(this.transactionForm.fromView(transaction));
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.saving.set(false);
  }

  onAccount(accountId: string): void {
    this.form.update((form) => ({ ...form, accountId }));
  }

  onKind(kind: string): void {
    this.form.update((form) => ({
      ...form,
      kind: kind as FinanceTransactionKind,
    }));
  }

  onCategory(category: string): void {
    this.form.update((form) => ({
      ...form,
      category: category as FinanceCategory,
    }));
  }

  onAmount(amount: string): void {
    this.form.update((form) => ({ ...form, amount }));
  }

  onNote(note: string): void {
    this.form.update((form) => ({ ...form, note }));
  }

  onStore(store: string): void {
    this.form.update((form) => ({ ...form, store }));
  }

  onDate(transactionDate: string): void {
    this.form.update((form) => ({ ...form, transactionDate }));
  }

  save(): void {
    if (!this.formValid() || this.saving()) return;

    this.saving.set(true);

    this.buildSaveRequest().subscribe({
      next: () => {
        this.saving.set(false);
        this.sheetOpen.set(false);
        this.reload();
      },
      error: () => this.saving.set(false),
    });
  }

  removeTransaction(transaction: FinanceTransactionView): void {
    this.deleteFinanceTransactionService
      .deleteFinanceTransaction(transaction.id)
      .subscribe({ next: () => this.reload() });
  }

  private buildSaveRequest(): Observable<void> {
    const form = this.form();
    const payload = this.transactionForm.toPayload(
      form,
      this.fallbackNote(form),
    );
    const editingId = this.editingId();

    if (editingId) {
      return this.updateFinanceTransactionService.updateFinanceTransaction(
        editingId,
        payload,
      );
    }

    return this.createFinanceTransactionService.createFinanceTransaction(
      payload,
    );
  }

  private fallbackNote(form: FinanceTransactionForm): string {
    return form.kind === FinanceTransactionKind.INCOME
      ? this.t("getEconomy.kind.income")
      : this.categoryCatalog.label(form.category);
  }

  private toRows(transactions: FinanceTransactionView[]): FinanceMovementRow[] {
    this.translationsReady();

    return transactions.map((transaction) => {
      const income = transaction.kind === FinanceTransactionKind.INCOME;
      const category = this.categoryCatalog.label(transaction.category);
      const origin = transaction.store ?? category;

      return {
        transaction,
        emoji: income
          ? this.categoryCatalog.incomeEmoji()
          : this.categoryCatalog.emoji(transaction.category),
        title: transaction.note || category,
        subtitle: `${origin} · ${this.view.dayShort(transaction.transactionDate)}`,
        amountLabel: `${income ? "+" : "−"}${this.view.money(transaction.amount)}`,
        income,
        tags: this.tagsFor(transaction),
      };
    });
  }

  private tagsFor(
    transaction: FinanceTransactionView,
  ): FinanceMovementRow["tags"] {
    const tags = [];

    if (this.hasSeveralAccounts()) {
      tags.push({ label: transaction.accountName, highlighted: false });
    }

    if (transaction.source === FinanceTransactionSource.TICKET) {
      tags.push({ label: this.t("getEconomy.tag.ticket"), highlighted: true });
    }

    if (transaction.source === FinanceTransactionSource.RECURRENCE) {
      tags.push({
        label: this.t("getEconomy.tag.recurring"),
        highlighted: false,
      });
    }

    return tags;
  }

  private reload(): void {
    this.load(true);

    const date = this.selectedDate();

    if (date) this.loadDay(date);
  }

  private load(silent = false): void {
    if (!silent) {
      this.loading.set(true);
      this.budgetLoading.set(true);
    }

    const month = this.month();

    this.getFinanceOverviewService.getFinanceOverview(month).subscribe({
      next: (response) => {
        this.overview.set(response.data.attributes);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.getFinanceTransactionsService.getFinanceTransactions(month).subscribe({
      next: (response) =>
        this.transactions.set(response.data.attributes.transactions),
    });

    this.getFinanceCalendarService.getFinanceCalendar(month).subscribe({
      next: (response) => this.calendarDays.set(response.data.attributes.days),
    });

    this.getFinanceAccountsService.getFinanceAccounts().subscribe({
      next: (response) => this.accounts.set(response.data.attributes.accounts),
    });

    this.getFinanceBudgetService.getFinanceBudget(month).subscribe({
      next: (response) => {
        this.budget.set(response.data.attributes);
        this.budgetLoading.set(false);
      },
      error: () => this.budgetLoading.set(false),
    });
  }

  private loadDay(date: string): void {
    this.getFinanceTransactionsService
      .getFinanceTransactions(this.month(), date)
      .subscribe({
        next: (response) =>
          this.dayTransactions.set(response.data.attributes.transactions),
      });
  }
}
