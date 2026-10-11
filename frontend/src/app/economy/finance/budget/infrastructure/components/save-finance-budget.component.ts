import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { delay } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { GlyphComponent } from "@shared/design-system/glyph/infrastructure/components/glyph.component";
import { AmountInputComponent } from "@shared/design-system/amount-input/infrastructure/components/amount-input.component";
import { AllocationRowComponent } from "@shared/design-system/allocation-row/infrastructure/components/allocation-row.component";
import { DividerComponent } from "@shared/design-system/divider/infrastructure/components/divider.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { ProgressBarComponent } from "@shared/design-system/progress-bar/infrastructure/components/progress-bar.component";
import { StepBadgeComponent } from "@shared/design-system/step-badge/infrastructure/components/step-badge.component";
import { SkeletonPanelComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-panel.component";
import { SkeletonRowsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-rows.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { SliderStepperComponent } from "@shared/design-system/slider-stepper/infrastructure/components/slider-stepper.component";
import {
  SegmentedOption,
  SegmentedToggleComponent,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { FinanceAmountPrivacyService } from "@economy/finance/privacy/application/services/finance-amount-privacy.service";
import { FinancePrivacyToggleComponent } from "@economy/finance/privacy/infrastructure/components/finance-privacy-toggle.component";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";
import { FinanceCategoryCatalogService } from "@economy/finance/transaction/application/services/finance-category-catalog.service";
import { GetFinanceBudgetSettingsService } from "@economy/finance/budget/application/services/get-finance-budget-settings.service";
import { SaveFinanceBudgetService } from "@economy/finance/budget/application/services/save-finance-budget.service";
import { FinanceBudgetFormService } from "@economy/finance/budget/application/services/finance-budget-form.service";
import { FinanceBudgetForm } from "@economy/finance/budget/domain/models/finance-budget-form.model";
import { FinanceBudgetCategoryKind } from "@economy/finance/budget/domain/models/finance-budget-category-kind.model";
import { FinanceBudgetCategoryForm } from "@economy/finance/budget/domain/models/finance-budget-category-form.model";
import { FinanceBudgetSettingsRow } from "@economy/finance/budget/domain/models/finance-budget-settings-row.model";
import { FinanceBudgetCategoryDraft } from "@economy/finance/budget/domain/models/finance-budget-category-draft.model";
import { FinanceBudgetCategorySheet } from "@economy/finance/budget/domain/models/finance-budget-category-sheet.model";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";
import { DiscardChangesModalComponent } from "@shared/design-system/discard-changes-modal/infrastructure/components/discard-changes-modal.component";
import { EditorDraft } from "@shared/editor-form/application/editor-draft";

const SAVINGS_MAX_PERCENTAGE = 60;
const REDIRECT_DELAY_MS = 600;

@Component({
  selector: "app-save-finance-budget",
  templateUrl: "./save-finance-budget.component.html",
  imports: [
    DiscardChangesModalComponent,
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
    NoteComponent,
    AmountInputComponent,
    GlyphComponent,
    SliderStepperComponent,
    AllocationRowComponent,
    DividerComponent,
    ModalSheetComponent,
    ProgressBarComponent,
    StepBadgeComponent,
    SegmentedToggleComponent,
    SkeletonPanelComponent,
    SkeletonRowsComponent,
    SkeletonSectionHeaderComponent,
    FinancePrivacyToggleComponent,
  ],
})
export class SaveFinanceBudgetComponent implements OnInit {
  private translationService = inject(TranslationService);
  private backNavigation = inject(BackNavigationService);
  private getFinanceBudgetSettingsService = inject(
    GetFinanceBudgetSettingsService,
  );
  private saveFinanceBudgetService = inject(SaveFinanceBudgetService);
  protected view = inject(FinanceViewService);
  protected budgetForm = inject(FinanceBudgetFormService);
  protected categoryCatalog = inject(FinanceCategoryCatalogService);
  private privacy = inject(FinanceAmountPrivacyService);

  readonly amountsHidden = this.privacy.amountsHidden;

  private readonly MODULE_PATH = "economy/finance/budget";

  readonly savingsMax = SAVINGS_MAX_PERCENTAGE;

  loading = signal(true);
  saving = signal(false);
  protected readonly draft = new EditorDraft(() => this.form());
  translationsReady = signal(false);

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
  savingsAmountLabel = computed(() =>
    this.view.sensitiveMoney(this.savingsAmount()),
  );
  savingsPercentageLabel = computed(
    () => `${Math.round(this.form().savingsPercentage)}%`,
  );

  unassignedAmount = computed(() => this.budgetForm.unassignedOf(this.form()));
  unassignedAmountLabel = computed(() =>
    this.view.sensitiveMoney(Math.abs(this.unassignedAmount())),
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

  savingsSubtitle = computed(() => {
    this.translationsReady();

    return this.t("saveFinanceBudget.steps.savings.subtitle").replace(
      "{amount}",
      this.savingsAmountLabel(),
    );
  });

  afterSavingsLabel = computed(() =>
    this.view.sensitiveMoney(this.budgetForm.afterSavingsOf(this.form())),
  );
  afterSavingsPercent = computed(() =>
    this.incomePercent(this.budgetForm.afterSavingsOf(this.form())),
  );

  fixedTotalLabel = computed(() =>
    this.view.sensitiveMoney(
      this.budgetForm.totalOf(this.form(), FinanceBudgetCategoryKind.FIXED),
    ),
  );
  variableTotalLabel = computed(() =>
    this.view.sensitiveMoney(
      this.budgetForm.totalOf(this.form(), FinanceBudgetCategoryKind.VARIABLE),
    ),
  );

  afterFixedLabel = computed(() =>
    this.view.sensitiveMoney(this.budgetForm.afterFixedOf(this.form())),
  );
  afterFixedPercent = computed(() =>
    this.incomePercent(this.budgetForm.afterFixedOf(this.form())),
  );

  unassignedPercent = computed(() =>
    this.incomePercent(this.unassignedAmount()),
  );

  kindOptions = computed<SegmentedOption[]>(() => {
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

  fixedRows = computed(() => this.rowsOf(FinanceBudgetCategoryKind.FIXED));
  variableRows = computed(() =>
    this.rowsOf(FinanceBudgetCategoryKind.VARIABLE),
  );

  categoryDraft = signal<FinanceBudgetCategoryDraft | null>(null);

  categorySheet = computed<FinanceBudgetCategorySheet | null>(() => {
    this.translationsReady();
    const draft = this.categoryDraft();

    if (draft === null) return null;

    const form = this.budgetForm.withCategory(
      this.form(),
      draft.index,
      draft.category,
    );
    const amount = this.budgetForm.amountOf(draft.category);
    const unassigned = this.budgetForm.unassignedOf(form);
    const freeKey =
      unassigned < 0
        ? "saveFinanceBudget.sheet.over"
        : "saveFinanceBudget.sheet.free";

    return {
      name: this.categoryCatalog.label(draft.category.category),
      kind: draft.category.kind,
      variable: draft.category.kind === FinanceBudgetCategoryKind.VARIABLE,
      amount,
      amountText: draft.category.amount,
      sliderMax: this.budgetForm.sliderMaxOf(form, draft.index),
      caption: this.t("saveFinanceBudget.sheet.caption").replace(
        "{percentage}",
        this.percentageLabel(this.budgetForm.percentageOf(form, amount)),
      ),
      freeLabel: this.t(freeKey).replace(
        "{amount}",
        this.view.sensitiveMoney(Math.abs(unassigned)),
      ),
      over: unassigned < 0,
    };
  });

  canSave = computed(
    () => this.budgetForm.isValid(this.form()) && !this.saving(),
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

  goBack(): void {
    this.draft.leave(() => this.backNavigation.back(["/economy/budget"]));
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

  openCategory(index: number): void {
    this.categoryDraft.set({ index, category: this.form().categories[index] });
  }

  closeCategory(): void {
    this.categoryDraft.set(null);
  }

  confirmCategory(): void {
    const draft = this.categoryDraft();

    if (draft === null) return;

    this.form.update((form) =>
      this.budgetForm.withCategory(form, draft.index, draft.category),
    );
    this.categoryDraft.set(null);
  }

  onDraftKind(kind: string): void {
    this.updateDraft({ kind: kind as FinanceBudgetCategoryKind });
  }

  onDraftAmount(amount: string): void {
    this.updateDraft({ amount });
  }

  onDraftSlider(amount: number): void {
    this.updateDraft({ amount: `${amount}` });
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
          this.draft.markSaved();
          this.backNavigation.leave(["/economy/budget"]);
        },
        error: () => this.saving.set(false),
      });
  }

  private percentageLabel(percentage: number): string {
    return `${Math.round(percentage)}%`;
  }

  private incomePercent(amount: number): number {
    return Math.max(
      0,
      Math.min(100, this.budgetForm.percentageOf(this.form(), amount)),
    );
  }

  private rowsOf(kind: FinanceBudgetCategoryKind): FinanceBudgetSettingsRow[] {
    this.translationsReady();

    return this.form()
      .categories.map((category, index) => ({
        category,
        index,
        amount: this.budgetForm.amountOf(category),
      }))
      .filter(({ category }) => category.kind === kind)
      .sort((left, right) => right.amount - left.amount)
      .map(({ category, index, amount }) => {
        const name = this.categoryCatalog.label(category.category);
        const amountLabel = this.view.sensitiveMoney(amount);

        return {
          key: category.category,
          index,
          name,
          glyph: this.categoryCatalog.glyph(category.category),
          color: this.categoryCatalog.color(category.category),
          amountLabel,
          editLabel: this.t("saveFinanceBudget.row.edit")
            .replace("{category}", name)
            .replace("{amount}", amountLabel),
        };
      });
  }

  private updateDraft(change: Partial<FinanceBudgetCategoryForm>): void {
    this.categoryDraft.update((draft) =>
      draft === null
        ? null
        : { ...draft, category: { ...draft.category, ...change } },
    );
  }

  private load(): void {
    this.loading.set(true);

    this.getFinanceBudgetSettingsService.getFinanceBudgetSettings().subscribe({
      next: (response) => {
        const settings = response.data.attributes;

        this.form.set(this.budgetForm.fromSettings(settings));
        this.draft.markSaved();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
