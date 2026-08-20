import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { delay } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { AmountInputComponent } from "@shared/design-system/amount-input/infrastructure/components/amount-input.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { SliderComponent } from "@shared/design-system/slider/infrastructure/components/slider.component";
import { AllocationBarComponent } from "@shared/design-system/allocation-bar/infrastructure/components/allocation-bar.component";
import { AllocationSegment } from "@shared/design-system/allocation-bar/domain/models/allocation-segment.model";
import { SkeletonPanelComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-panel.component";
import { SkeletonRowsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-rows.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import {
  TypeToggleComponent,
  TypeToggleOption,
} from "@shared/design-system/type-toggle/infrastructure/components/type-toggle.component";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";
import { FinanceCategoryCatalogService } from "@economy/finance/transaction/application/services/finance-category-catalog.service";
import { GetFinanceBudgetSettingsService } from "@economy/finance/budget/application/services/get-finance-budget-settings.service";
import { SaveFinanceBudgetService } from "@economy/finance/budget/application/services/save-finance-budget.service";
import { FinanceBudgetFormService } from "@economy/finance/budget/application/services/finance-budget-form.service";
import { FinanceBudgetForm } from "@economy/finance/budget/domain/models/finance-budget-form.model";
import { FinanceBudgetCategoryKind } from "@economy/finance/budget/domain/models/finance-budget-category-kind.model";
import { FinanceBudgetSettingsRow } from "@economy/finance/budget/domain/models/finance-budget-settings-row.model";

const SAVINGS_MAX_PERCENTAGE = 60;
const REDIRECT_DELAY_MS = 600;

@Component({
  selector: "app-save-finance-budget",
  templateUrl: "./save-finance-budget.component.html",
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
    CardComponent,
    SectionHeaderComponent,
    NoteComponent,
    AmountInputComponent,
    EmojiTileComponent,
    SliderComponent,
    AllocationBarComponent,
    TypeToggleComponent,
    SkeletonPanelComponent,
    SkeletonRowsComponent,
    SkeletonSectionHeaderComponent,
  ],
})
export class SaveFinanceBudgetComponent implements OnInit {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private floatingToastService = inject(FloatingToastService);
  private getFinanceBudgetSettingsService = inject(
    GetFinanceBudgetSettingsService,
  );
  private saveFinanceBudgetService = inject(SaveFinanceBudgetService);
  protected view = inject(FinanceViewService);
  protected budgetForm = inject(FinanceBudgetFormService);
  protected categoryCatalog = inject(FinanceCategoryCatalogService);

  private readonly MODULE_PATH = "economy/finance/budget";

  readonly savingsMax = SAVINGS_MAX_PERCENTAGE;

  loading = signal(true);
  saving = signal(false);
  translationsReady = signal(false);

  suggestedIncome = signal(0);
  form = signal<FinanceBudgetForm>({
    referenceIncome: "",
    savingsPercentage: 0,
    categories: [],
  });

  savingsStep = computed(() => this.budgetForm.savingsStep());
  variableStep = computed(() => this.budgetForm.variableStep());

  referenceIncome = computed(() =>
    this.budgetForm.referenceIncomeOf(this.form()),
  );
  hasReferenceIncome = computed(() => this.referenceIncome() > 0);

  savingsAmount = computed(() => this.budgetForm.savingsAmountOf(this.form()));
  savingsAmountLabel = computed(() => this.view.money(this.savingsAmount()));
  savingsPercentageLabel = computed(
    () => `${Math.round(this.form().savingsPercentage)}%`,
  );

  unassignedAmount = computed(() => this.budgetForm.unassignedOf(this.form()));
  unassignedAmountLabel = computed(() =>
    this.view.money(Math.abs(this.unassignedAmount())),
  );
  unassignedPercentageLabel = computed(() =>
    this.percentageLabel(
      this.budgetForm.percentageOf(this.form(), this.unassignedAmount()),
    ),
  );
  overAssigned = computed(() => this.unassignedAmount() < 0);
  unassignedHint = computed(() => {
    this.translationsReady();
    const key = this.overAssigned()
      ? "saveFinanceBudget.unassigned.over"
      : "saveFinanceBudget.unassigned.left";

    return this.t(key);
  });

  suggestedIncomeHint = computed(() => {
    this.translationsReady();
    const suggested = this.suggestedIncome();

    if (suggested <= 0) return this.t("saveFinanceBudget.income.noHistory");

    return this.t("saveFinanceBudget.income.hint").replace(
      "{amount}",
      this.view.money(suggested),
    );
  });

  kindOptions = computed<TypeToggleOption[]>(() => {
    this.translationsReady();

    return [
      {
        value: FinanceBudgetCategoryKind.VARIABLE,
        label: this.t("saveFinanceBudget.kind.variable"),
      },
      {
        value: FinanceBudgetCategoryKind.FIXED,
        label: this.t("saveFinanceBudget.kind.fixed"),
      },
    ];
  });

  categoryRows = computed<FinanceBudgetSettingsRow[]>(() => {
    this.translationsReady();
    const form = this.form();

    return form.categories.map((category, index) => {
      const amount = this.budgetForm.amountOf(category);

      return {
        key: category.category,
        index,
        name: this.categoryCatalog.label(category.category),
        emoji: this.categoryCatalog.emoji(category.category),
        kind: category.kind,
        variable: category.kind === FinanceBudgetCategoryKind.VARIABLE,
        amount,
        amountText: category.amount,
        amountLabel: this.view.money(amount),
        percentageLabel: this.percentageLabel(
          this.budgetForm.percentageOf(form, amount),
        ),
        sliderMax: this.budgetForm.sliderMaxOf(form, index),
      };
    });
  });

  allocationSegments = computed<AllocationSegment[]>(() => {
    this.translationsReady();
    const form = this.form();
    const savings = this.budgetForm.percentageOf(form, this.savingsAmount());
    const segments: AllocationSegment[] = [
      {
        key: "savings",
        label: this.t("saveFinanceBudget.legend.savings"),
        color: "var(--ds-success)",
        percentage: Math.max(0, savings),
      },
    ];

    return segments.concat(
      this.categoryRows()
        .filter((row) => row.amount > 0)
        .map((row) => ({
          key: row.key,
          label: row.name,
          color: this.categoryCatalog.color(row.key),
          percentage: Math.max(
            0,
            this.budgetForm.percentageOf(form, row.amount),
          ),
        })),
    );
  });

  canSave = computed(
    () => this.budgetForm.isValid(this.form()) && !this.saving(),
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

  goBack(): void {
    this.router.navigate(["/economy/budget"]);
  }

  onReferenceIncome(referenceIncome: string): void {
    this.form.update((form) =>
      this.budgetForm.withReferenceIncome(form, referenceIncome),
    );
  }

  onSavingsPercentage(savingsPercentage: number): void {
    this.form.update((form) =>
      this.budgetForm.withSavingsPercentage(form, savingsPercentage),
    );
  }

  onCategoryKind(index: number, kind: string): void {
    this.form.update((form) =>
      this.budgetForm.withCategoryKind(
        form,
        index,
        kind as FinanceBudgetCategoryKind,
      ),
    );
  }

  onCategoryAmount(index: number, amount: string): void {
    this.form.update((form) =>
      this.budgetForm.withCategoryAmount(form, index, amount),
    );
  }

  onCategorySlider(index: number, amount: number): void {
    this.onCategoryAmount(index, `${amount}`);
  }

  save(): void {
    if (!this.canSave()) return;

    this.saving.set(true);

    this.saveFinanceBudgetService
      .saveFinanceBudget(this.budgetForm.toPayload(this.form()))
      .pipe(delay(REDIRECT_DELAY_MS))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.floatingToastService.showToast({
            status: 200,
            title: this.t("saveFinanceBudget.saved"),
            keyTranslation: "saveFinanceBudget.saved",
            details: [],
          });
          this.router.navigate(["/economy/budget"]);
        },
        error: () => this.saving.set(false),
      });
  }

  private percentageLabel(percentage: number): string {
    return `${Math.round(percentage)}%`;
  }

  private load(): void {
    this.loading.set(true);

    this.getFinanceBudgetSettingsService.getFinanceBudgetSettings().subscribe({
      next: (response) => {
        const settings = response.data.attributes;

        this.suggestedIncome.set(settings.suggestedIncome);
        this.form.set(this.budgetForm.fromSettings(settings));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
