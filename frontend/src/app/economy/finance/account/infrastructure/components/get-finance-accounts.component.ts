import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, forkJoin, of, switchMap } from "rxjs";
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
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import { AmountInputComponent } from "@shared/design-system/amount-input/infrastructure/components/amount-input.component";
import { SwipeToDeleteComponent } from "@shared/design-system/swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { TransactionRowComponent } from "@shared/design-system/transaction-row/infrastructure/components/transaction-row.component";
import {
  ChoiceChipOption,
  ChoiceChipsComponent,
} from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";
import { GetFinanceAccountsService } from "@economy/finance/account/application/services/get-finance-accounts.service";
import { CreateFinanceAccountService } from "@economy/finance/account/application/services/create-finance-account.service";
import { UpdateFinanceAccountService } from "@economy/finance/account/application/services/update-finance-account.service";
import { DeleteFinanceAccountService } from "@economy/finance/account/application/services/delete-finance-account.service";
import { FinanceAccountCatalogService } from "@economy/finance/account/application/services/finance-account-catalog.service";
import { FinanceAccountFormService } from "@economy/finance/account/application/services/finance-account-form.service";
import { FinanceAccount } from "@economy/finance/account/domain/models/finance-account.model";
import { FinanceAccountForm } from "@economy/finance/account/domain/models/finance-account-form.model";
import { FinanceAccountRow } from "@economy/finance/account/domain/models/finance-account-row.model";
import { FinanceAccountType } from "@economy/finance/account/domain/models/finance-account-type.model";
import { GetFinanceBalanceChecksService } from "@economy/finance/balance-check/application/services/get-finance-balance-checks.service";
import { CreateFinanceBalanceCheckService } from "@economy/finance/balance-check/application/services/create-finance-balance-check.service";
import { UpdateFinanceBalanceCheckService } from "@economy/finance/balance-check/application/services/update-finance-balance-check.service";
import { DeleteFinanceBalanceCheckService } from "@economy/finance/balance-check/application/services/delete-finance-balance-check.service";
import { SetFinanceAccountBalanceService } from "@economy/finance/balance-check/application/services/set-finance-account-balance.service";
import { FinanceBalanceCheckFormService } from "@economy/finance/balance-check/application/services/finance-balance-check-form.service";
import { FinanceBalanceCheck } from "@economy/finance/balance-check/domain/models/finance-balance-check.model";
import { FinanceBalanceCheckForm } from "@economy/finance/balance-check/domain/models/finance-balance-check-form.model";
import { FinanceBalanceCheckRow } from "@economy/finance/balance-check/domain/models/finance-balance-check-row.model";

@Component({
  selector: "app-get-finance-accounts",
  templateUrl: "./get-finance-accounts.component.html",
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
    SectionHeaderComponent,
    SkeletonListComponent,
    EmptyStateComponent,
    ModalSheetComponent,
    NoteComponent,
    TextInputComponent,
    DateInputComponent,
    AmountInputComponent,
    SwipeToDeleteComponent,
    TransactionRowComponent,
    ChoiceChipsComponent,
  ],
})
export class GetFinanceAccountsComponent implements OnInit {
  private translationService = inject(TranslationService);
  private authSession = inject(AuthSessionService);
  private router = inject(Router);
  private getFinanceAccountsService = inject(GetFinanceAccountsService);
  private createFinanceAccountService = inject(CreateFinanceAccountService);
  private updateFinanceAccountService = inject(UpdateFinanceAccountService);
  private deleteFinanceAccountService = inject(DeleteFinanceAccountService);
  private getFinanceBalanceChecksService = inject(
    GetFinanceBalanceChecksService,
  );
  private createFinanceBalanceCheckService = inject(
    CreateFinanceBalanceCheckService,
  );
  private updateFinanceBalanceCheckService = inject(
    UpdateFinanceBalanceCheckService,
  );
  private deleteFinanceBalanceCheckService = inject(
    DeleteFinanceBalanceCheckService,
  );
  private setFinanceAccountBalanceService = inject(
    SetFinanceAccountBalanceService,
  );
  protected view = inject(FinanceViewService);
  protected catalog = inject(FinanceAccountCatalogService);
  protected accountForm = inject(FinanceAccountFormService);
  protected checkForm = inject(FinanceBalanceCheckFormService);

  private readonly MODULE_PATH = "economy/finance/account";

  protected readonly checkEmoji = "🧾";

  canWrite = computed(() => this.authSession.isGod());

  loading = signal(true);
  saving = signal(false);
  translationsReady = signal(false);

  accounts = signal<FinanceAccount[]>([]);
  checks = signal<FinanceBalanceCheck[]>([]);
  totalBalance = signal(0);

  accountSheetOpen = signal(false);
  editingAccountId = signal<string | null>(null);
  account = signal<FinanceAccountForm>(this.accountForm.empty());
  balanceAtOpen = signal("");

  checkSheetOpen = signal(false);
  editingCheckId = signal<string | null>(null);
  check = signal<FinanceBalanceCheckForm>(
    this.checkForm.empty("", this.view.todayIso()),
  );

  totalBalanceLabel = computed(() => this.view.money(this.totalBalance()));
  hasAccounts = computed(() => this.accounts().length > 0);

  accountRows = computed<FinanceAccountRow[]>(() => {
    this.translationsReady();
    const checks = this.checks();

    return this.accounts().map((account) => ({
      account,
      emoji: this.catalog.emoji(account.type),
      typeLabel: this.catalog.label(account.type),
      balanceLabel: this.view.money(account.balance),
      lastCheckLabel: this.lastCheckLabel(account),
      checks: checks
        .filter((check) => check.accountId === account.id)
        .map((check) => this.toCheckRow(check)),
    }));
  });

  typeOptions = computed<ChoiceChipOption[]>(() => {
    this.translationsReady();

    return this.catalog.chipOptions();
  });

  accountSheetTitle = computed(() =>
    this.editingAccountId()
      ? "getFinanceAccounts.sheet.editTitle"
      : "getFinanceAccounts.sheet.createTitle",
  );
  checkSheetTitle = computed(() =>
    this.editingCheckId()
      ? "getFinanceAccounts.check.editTitle"
      : "getFinanceAccounts.check.createTitle",
  );
  checkSheetAccountName = computed(() => {
    const accountId = this.check().accountId;

    return (
      this.accounts().find((account) => account.id === accountId)?.name ?? ""
    );
  });
  accountFormValid = computed(() => this.accountForm.isValid(this.account()));
  checkFormValid = computed(() => this.checkForm.isValid(this.check()));
  canDeleteAccount = computed(() => {
    const editingId = this.editingAccountId();
    const account = this.accounts().find((item) => item.id === editingId);

    return account !== undefined && account.transactionCount === 0;
  });

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

  openNewAccountSheet(): void {
    if (!this.canWrite()) return;

    const form = this.accountForm.empty();

    this.editingAccountId.set(null);
    this.account.set(form);
    this.balanceAtOpen.set(form.balance);
    this.accountSheetOpen.set(true);
  }

  openEditAccountSheet(account: FinanceAccount): void {
    if (!this.canWrite()) return;

    const form = this.accountForm.fromAccount(account);

    this.editingAccountId.set(account.id);
    this.account.set(form);
    this.balanceAtOpen.set(form.balance);
    this.accountSheetOpen.set(true);
  }

  closeAccountSheet(): void {
    this.accountSheetOpen.set(false);
    this.saving.set(false);
  }

  onAccountName(name: string): void {
    this.account.update((form) => ({ ...form, name }));
  }

  onAccountBalance(balance: string): void {
    this.account.update((form) => ({ ...form, balance }));
  }

  onAccountType(type: string): void {
    this.account.update((form) => ({
      ...form,
      type: type as FinanceAccountType,
    }));
  }

  saveAccount(): void {
    if (!this.accountFormValid() || this.saving()) return;

    this.saving.set(true);

    this.buildAccountRequest().subscribe({
      next: () => {
        this.saving.set(false);
        this.accountSheetOpen.set(false);
        this.load(true);
      },
      error: () => this.saving.set(false),
    });
  }

  deleteAccount(): void {
    const editingId = this.editingAccountId();

    if (!this.canWrite() || editingId === null || this.saving()) return;

    this.saving.set(true);

    this.deleteFinanceAccountService.deleteFinanceAccount(editingId).subscribe({
      next: () => {
        this.saving.set(false);
        this.accountSheetOpen.set(false);
        this.load(true);
      },
      error: () => this.saving.set(false),
    });
  }

  openNewCheckSheet(account: FinanceAccount): void {
    if (!this.canWrite()) return;

    this.editingCheckId.set(null);
    this.check.set(this.checkForm.empty(account.id, this.view.todayIso()));
    this.checkSheetOpen.set(true);
  }

  openEditCheckSheet(check: FinanceBalanceCheck): void {
    if (!this.canWrite()) return;

    this.editingCheckId.set(check.id);
    this.check.set(this.checkForm.fromCheck(check));
    this.checkSheetOpen.set(true);
  }

  closeCheckSheet(): void {
    this.checkSheetOpen.set(false);
    this.saving.set(false);
  }

  onCheckAmount(amount: string): void {
    this.check.update((form) => ({ ...form, amount }));
  }

  onCheckDate(checkDate: string): void {
    this.check.update((form) => ({ ...form, checkDate }));
  }

  onCheckNote(note: string): void {
    this.check.update((form) => ({ ...form, note }));
  }

  saveCheck(): void {
    if (!this.checkFormValid() || this.saving()) return;

    this.saving.set(true);

    this.buildCheckRequest().subscribe({
      next: () => {
        this.saving.set(false);
        this.checkSheetOpen.set(false);
        this.load(true);
      },
      error: () => this.saving.set(false),
    });
  }

  removeCheck(check: FinanceBalanceCheck): void {
    if (!this.canWrite()) return;

    this.deleteFinanceBalanceCheckService
      .deleteFinanceBalanceCheck(check.id)
      .subscribe({ next: () => this.load(true) });
  }

  private buildAccountRequest(): Observable<void> {
    const editingId = this.editingAccountId();

    if (editingId) {
      return this.updateFinanceAccountService
        .updateFinanceAccount(
          editingId,
          this.accountForm.toPayload(this.account()),
        )
        .pipe(switchMap(() => this.buildBalanceRequest(editingId)));
    }

    return this.createFinanceAccountService.createFinanceAccount(
      this.accountForm.toCreatePayload(this.account(), this.view.todayIso()),
    );
  }

  private buildBalanceRequest(accountId: string): Observable<void> {
    const balance = this.accountForm.balanceOf(this.account());

    if (balance === null || this.account().balance === this.balanceAtOpen()) {
      return of(undefined);
    }

    return this.setFinanceAccountBalanceService.setFinanceAccountBalance(
      accountId,
      { balance, checkDate: this.view.todayIso(), note: "" },
    );
  }

  private buildCheckRequest(): Observable<void> {
    const payload = this.checkForm.toPayload(this.check());
    const editingId = this.editingCheckId();

    if (editingId) {
      return this.updateFinanceBalanceCheckService.updateFinanceBalanceCheck(
        editingId,
        payload,
      );
    }

    return this.createFinanceBalanceCheckService.createFinanceBalanceCheck(
      payload,
    );
  }

  private lastCheckLabel(account: FinanceAccount): string {
    if (account.lastCheckDate === null) {
      return this.t("getFinanceAccounts.noCheck");
    }

    return `${this.t("getFinanceAccounts.lastCheck")} ${this.view.dayShort(account.lastCheckDate)}`;
  }

  private toCheckRow(check: FinanceBalanceCheck): FinanceBalanceCheckRow {
    const hasDrift = Math.abs(check.drift) >= 0.01;

    return {
      check,
      dateLabel: this.view.dayLong(check.checkDate),
      amountLabel: this.view.money(check.amount),
      driftLabel: hasDrift
        ? `${this.t("getFinanceAccounts.check.drift")} ${this.view.signedMoney(check.drift)}`
        : this.t("getFinanceAccounts.check.noDrift"),
      driftPositive: check.drift >= 0,
      hasDrift,
    };
  }

  private load(silent = false): void {
    if (!silent) this.loading.set(true);

    forkJoin({
      accounts: this.getFinanceAccountsService.getFinanceAccounts(),
      checks: this.getFinanceBalanceChecksService.getFinanceBalanceChecks(),
    }).subscribe({
      next: (responses) => {
        this.accounts.set(responses.accounts.data.attributes.accounts);
        this.totalBalance.set(responses.accounts.data.attributes.balance);
        this.checks.set(responses.checks.data.attributes.checks);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
