import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, forkJoin } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { AmountInputComponent } from "@shared/design-system/amount-input/infrastructure/components/amount-input.component";
import { ToggleSwitchComponent } from "@shared/design-system/toggle-switch/infrastructure/components/toggle-switch.component";
import { SwipeToDeleteComponent } from "@shared/design-system/swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { TransactionRowComponent } from "@shared/design-system/transaction-row/infrastructure/components/transaction-row.component";
import {
  SegmentedOption,
  SegmentedToggleComponent,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import {
  ChoiceChipOption,
  ChoiceChipsComponent,
} from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { GetFinanceRecurrencesService } from "@economy/finance/recurrence/application/services/get-finance-recurrences.service";
import { CreateFinanceRecurrenceService } from "@economy/finance/recurrence/application/services/create-finance-recurrence.service";
import { UpdateFinanceRecurrenceService } from "@economy/finance/recurrence/application/services/update-finance-recurrence.service";
import { DeleteFinanceRecurrenceService } from "@economy/finance/recurrence/application/services/delete-finance-recurrence.service";
import { FinanceRecurrenceFormService } from "@economy/finance/recurrence/application/services/finance-recurrence-form.service";
import { FinanceRecurrence } from "@economy/finance/recurrence/domain/models/finance-recurrence.model";
import { FinanceRecurrenceForm } from "@economy/finance/recurrence/domain/models/finance-recurrence-form.model";
import { FinanceRecurrenceRow } from "@economy/finance/recurrence/domain/models/finance-recurrence-row.model";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";
import { FinanceCategoryCatalogService } from "@economy/finance/transaction/application/services/finance-category-catalog.service";
import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";
import { FinanceTransactionKind } from "@economy/finance/transaction/domain/models/finance-transaction-kind.model";
import { GetFinanceAccountsService } from "@economy/finance/account/application/services/get-finance-accounts.service";
import { FinanceAccountCatalogService } from "@economy/finance/account/application/services/finance-account-catalog.service";
import { FinanceAccount } from "@economy/finance/account/domain/models/finance-account.model";

@Component({
  selector: "app-get-finance-recurrences",
  templateUrl: "./get-finance-recurrences.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    StackComponent,
    TextComponent,
    HeadingComponent,
    ButtonComponent,
    IconButtonComponent,
    CardComponent,
    SkeletonListComponent,
    EmptyStateComponent,
    ModalSheetComponent,
    NoteComponent,
    TextInputComponent,
    DateInputComponent,
    NumberInputComponent,
    AmountInputComponent,
    ToggleSwitchComponent,
    SwipeToDeleteComponent,
    TransactionRowComponent,
    SegmentedToggleComponent,
    ChoiceChipsComponent,
  ],
})
export class GetFinanceRecurrencesComponent implements OnInit {
  private translationService = inject(TranslationService);
  private authSession = inject(AuthSessionService);
  private router = inject(Router);
  private getFinanceRecurrencesService = inject(GetFinanceRecurrencesService);
  private createFinanceRecurrenceService = inject(
    CreateFinanceRecurrenceService,
  );
  private updateFinanceRecurrenceService = inject(
    UpdateFinanceRecurrenceService,
  );
  private deleteFinanceRecurrenceService = inject(
    DeleteFinanceRecurrenceService,
  );
  private getFinanceAccountsService = inject(GetFinanceAccountsService);
  protected view = inject(FinanceViewService);
  protected categoryCatalog = inject(FinanceCategoryCatalogService);
  protected accountCatalog = inject(FinanceAccountCatalogService);
  protected recurrenceForm = inject(FinanceRecurrenceFormService);

  private readonly MODULE_PATH = "economy/finance/recurrence";
  private readonly DEFAULT_CHARGE_DAY = 1;

  canWrite = computed(() => this.authSession.isGod());

  loading = signal(true);
  saving = signal(false);
  translationsReady = signal(false);

  recurrences = signal<FinanceRecurrence[]>([]);
  accounts = signal<FinanceAccount[]>([]);
  monthlyIncome = signal(0);
  monthlyExpense = signal(0);

  sheetOpen = signal(false);
  editingId = signal<string | null>(null);
  form = signal<FinanceRecurrenceForm>(
    this.recurrenceForm.empty("", "", this.DEFAULT_CHARGE_DAY),
  );

  hasAccounts = computed(() => this.accounts().length > 0);
  hasRecurrences = computed(() => this.recurrences().length > 0);
  monthlyIncomeLabel = computed(() => this.view.money(this.monthlyIncome()));
  monthlyExpenseLabel = computed(() => this.view.money(this.monthlyExpense()));
  monthlyNetLabel = computed(() =>
    this.view.signedMoney(this.monthlyIncome() - this.monthlyExpense()),
  );

  recurrenceRows = computed<FinanceRecurrenceRow[]>(() => {
    this.translationsReady();

    return this.recurrences().map((recurrence) => ({
      recurrence,
      emoji: this.emojiOf(recurrence),
      amountLabel: this.amountLabelOf(recurrence),
      scheduleLabel: `${this.t("getFinanceRecurrences.day")} ${recurrence.dayOfMonth} · ${recurrence.accountName}`,
      nextChargeLabel: this.nextChargeLabelOf(recurrence),
    }));
  });

  accountOptions = computed<ChoiceChipOption[]>(() =>
    this.accounts().map((account) => ({
      value: account.id,
      label: `${this.accountCatalog.emoji(account.type)} ${account.name}`,
    })),
  );
  categoryOptions = computed<ChoiceChipOption[]>(() => {
    this.translationsReady();

    return this.categoryCatalog.chipOptions();
  });
  kindOptions = computed<SegmentedOption[]>(() => {
    this.translationsReady();

    return [
      {
        value: FinanceTransactionKind.EXPENSE,
        label: this.t("getFinanceRecurrences.kind.expense"),
      },
      {
        value: FinanceTransactionKind.INCOME,
        label: this.t("getFinanceRecurrences.kind.income"),
      },
    ];
  });

  isIncomeForm = computed(
    () => this.form().kind === FinanceTransactionKind.INCOME,
  );
  sheetTitle = computed(() =>
    this.editingId()
      ? "getFinanceRecurrences.sheet.editTitle"
      : "getFinanceRecurrences.sheet.createTitle",
  );
  noteLabel = computed(() =>
    this.isIncomeForm()
      ? "getFinanceRecurrences.sheet.conceptLabel"
      : "getFinanceRecurrences.sheet.noteLabel",
  );
  notePlaceholder = computed(() =>
    this.isIncomeForm()
      ? "getFinanceRecurrences.sheet.conceptPlaceholder"
      : "getFinanceRecurrences.sheet.notePlaceholder",
  );
  storeLabel = computed(() =>
    this.isIncomeForm()
      ? "getFinanceRecurrences.sheet.originLabel"
      : "getFinanceRecurrences.sheet.storeLabel",
  );
  formValid = computed(() => this.recurrenceForm.isValid(this.form()));

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

  goBack(): void {
    this.router.navigate(["/economy"]);
  }

  openNewSheet(): void {
    if (!this.canWrite() || !this.hasAccounts()) return;

    this.editingId.set(null);
    this.form.set(
      this.recurrenceForm.empty(
        this.accounts()[0].id,
        this.view.currentMonth(),
        this.DEFAULT_CHARGE_DAY,
      ),
    );
    this.sheetOpen.set(true);
  }

  openEditSheet(recurrence: FinanceRecurrence): void {
    if (!this.canWrite()) return;

    this.editingId.set(recurrence.id);
    this.form.set(this.recurrenceForm.fromRecurrence(recurrence));
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.saving.set(false);
  }

  onKind(kind: string): void {
    this.form.update((form) => ({
      ...form,
      kind: kind as FinanceTransactionKind,
    }));
  }

  onAccount(accountId: string): void {
    this.form.update((form) => ({ ...form, accountId }));
  }

  onAmount(amount: string): void {
    this.form.update((form) => ({ ...form, amount }));
  }

  onCategory(category: string): void {
    this.form.update((form) => ({
      ...form,
      category: category as FinanceCategory,
    }));
  }

  onNote(note: string): void {
    this.form.update((form) => ({ ...form, note }));
  }

  onStore(store: string): void {
    this.form.update((form) => ({ ...form, store }));
  }

  onDayOfMonth(dayOfMonth: number): void {
    this.form.update((form) => ({ ...form, dayOfMonth }));
  }

  onStartMonth(startMonth: string): void {
    this.form.update((form) => ({ ...form, startMonth }));
  }

  onEndMonth(endMonth: string): void {
    this.form.update((form) => ({ ...form, endMonth }));
  }

  onActive(active: boolean): void {
    this.form.update((form) => ({ ...form, active }));
  }

  save(): void {
    if (!this.formValid() || this.saving()) return;

    this.saving.set(true);

    this.buildSaveRequest().subscribe({
      next: () => {
        this.saving.set(false);
        this.sheetOpen.set(false);
        this.load(true);
      },
      error: () => this.saving.set(false),
    });
  }

  remove(recurrence: FinanceRecurrence): void {
    if (!this.canWrite()) return;

    this.deleteFinanceRecurrenceService
      .deleteFinanceRecurrence(recurrence.id)
      .subscribe({ next: () => this.load(true) });
  }

  private buildSaveRequest(): Observable<void> {
    const form = this.form();
    const payload = this.recurrenceForm.toPayload(
      form,
      this.fallbackNote(form),
    );
    const editingId = this.editingId();

    if (editingId) {
      return this.updateFinanceRecurrenceService.updateFinanceRecurrence(
        editingId,
        payload,
      );
    }

    return this.createFinanceRecurrenceService.createFinanceRecurrence(payload);
  }

  private fallbackNote(form: FinanceRecurrenceForm): string {
    return form.kind === FinanceTransactionKind.INCOME
      ? this.t("getFinanceRecurrences.kind.income")
      : this.categoryCatalog.label(form.category);
  }

  private emojiOf(recurrence: FinanceRecurrence): string {
    return recurrence.kind === FinanceTransactionKind.INCOME
      ? this.categoryCatalog.incomeEmoji()
      : this.categoryCatalog.emoji(recurrence.category);
  }

  private amountLabelOf(recurrence: FinanceRecurrence): string {
    const sign = recurrence.kind === FinanceTransactionKind.INCOME ? "+" : "−";

    return `${sign}${this.view.money(recurrence.amount)}`;
  }

  private nextChargeLabelOf(recurrence: FinanceRecurrence): string {
    if (!recurrence.active) {
      return this.t("getFinanceRecurrences.paused");
    }

    if (recurrence.nextChargeDate === null) {
      return this.t("getFinanceRecurrences.finished");
    }

    return `${this.t("getFinanceRecurrences.next")} ${this.view.dayShort(recurrence.nextChargeDate)}`;
  }

  private load(silent = false): void {
    if (!silent) this.loading.set(true);

    forkJoin({
      accounts: this.getFinanceAccountsService.getFinanceAccounts(),
      recurrences: this.getFinanceRecurrencesService.getFinanceRecurrences(),
    }).subscribe({
      next: (responses) => {
        this.accounts.set(responses.accounts.data.attributes.accounts);
        this.recurrences.set(responses.recurrences.data.attributes.recurrences);
        this.monthlyIncome.set(
          responses.recurrences.data.attributes.monthlyIncome,
        );
        this.monthlyExpense.set(
          responses.recurrences.data.attributes.monthlyExpense,
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
