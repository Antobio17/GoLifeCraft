import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AutosaveService } from "@shared/autosave/application/services/autosave.service";
import { UndoService } from "@shared/undo/application/services/undo.service";
import { SaveStatusComponent } from "@shared/design-system/save-status/infrastructure/components/save-status.component";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { DiarySummaryComponent } from "@shared/design-system/diary-summary/infrastructure/components/diary-summary.component";
import { DiaryEntryComponent } from "@shared/design-system/diary-entry/infrastructure/components/diary-entry.component";
import { MacroBadgesComponent } from "@shared/design-system/macro-badges/infrastructure/components/macro-badges.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { PlaceholderNoteComponent } from "@shared/design-system/placeholder-note/infrastructure/components/placeholder-note.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SkeletonSummaryComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-summary.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { ChoiceRowComponent } from "@shared/design-system/choice-row/infrastructure/components/choice-row.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { NutrientInputComponent } from "@shared/design-system/nutrient-input/infrastructure/components/nutrient-input.component";
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { AmountInputComponent } from "@shared/design-system/amount-input/infrastructure/components/amount-input.component";
import { EmojiChoiceGridComponent } from "@shared/design-system/emoji-choice-grid/infrastructure/components/emoji-choice-grid.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import {
  CalendarComponent,
  CalendarCell,
  CalendarLegendItem,
} from "@shared/design-system/calendar/infrastructure/components/calendar.component";
import {
  SegmentedOption,
  SegmentedToggleComponent,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
import { GetRecipesService } from "@nutrition/recipe/recipe/application/services/get-recipes.service";
import { GetDiaryService } from "@nutrition/diary/diary/application/services/get-diary.service";
import { GetDiaryCalendarService } from "@nutrition/diary/diary/application/services/get-diary-calendar.service";
import {
  DiaryViewService,
  MacroShortLabels,
} from "@nutrition/diary/diary/application/services/diary-view.service";
import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";
import { DiaryCalendarViewService } from "@nutrition/diary/diary/application/services/diary-calendar-view.service";
import {
  DiaryCalendarDay,
  DiaryCalendarStatus,
} from "@nutrition/diary/diary/domain/models/diary-calendar.model";
import {
  DiaryChoice,
  DiaryPickerService,
} from "@nutrition/diary/diary/application/services/diary-picker.service";
import { CreateDiaryEntryService } from "@nutrition/diary/diary/application/services/create-diary-entry.service";
import { UpdateDiaryEntryService } from "@nutrition/diary/diary/application/services/update-diary-entry.service";
import { UpdateDiaryEntryNodeService } from "@nutrition/diary/diary/application/services/update-diary-entry-node.service";
import { ResetDiaryEntryTreeService } from "@nutrition/diary/diary/application/services/reset-diary-entry-tree.service";
import { AssignDiaryEntryLotService } from "@nutrition/diary/diary/application/services/assign-diary-entry-lot.service";
import {
  DiaryLotLabels,
  DiaryLotViewService,
} from "@nutrition/diary/diary/application/services/diary-lot-view.service";
import { GetRecipeLotsService } from "@nutrition/kitchen/production/application/services/get-recipe-lots.service";
import { DiaryLotRow } from "@nutrition/diary/diary/domain/models/diary-lot-row.model";
import { DiaryTreeViewService } from "@nutrition/diary/diary/application/services/diary-tree-view.service";
import { DeleteDiaryEntryService } from "@nutrition/diary/diary/application/services/delete-diary-entry.service";
import { ConsumeDiaryMealService } from "@nutrition/diary/diary/application/services/consume-diary-meal.service";
import { DiaryTreeComponent } from "@shared/design-system/diary-tree/infrastructure/components/diary-tree.component";
import {
  DiaryTreeQuantityChange,
  DiaryTreeUnitChange,
} from "@shared/design-system/diary-tree/domain/models/diary-tree-change.model";
import {
  DiaryDay,
  DiaryEntryView,
  DiaryMealView,
} from "@nutrition/diary/diary/domain/models/diary.model";
import { DiaryEntryKind } from "@nutrition/diary/diary/domain/models/diary-entry-kind.model";
import { DiaryStockState } from "@nutrition/diary/diary/domain/models/diary-stock-state.model";
import { CreateQuickDiaryEntryService } from "@nutrition/diary/diary/application/services/create-quick-diary-entry.service";
import { UpdateQuickDiaryEntryService } from "@nutrition/diary/diary/application/services/update-quick-diary-entry.service";
import {
  QuickDiaryEntryForm,
  QuickDiaryEntryFormService,
} from "@nutrition/diary/diary/application/services/quick-diary-entry-form.service";
import { UpdateDiaryGoalService } from "@nutrition/diary/goal/application/services/update-diary-goal.service";
import { SetDiaryGoalDayService } from "@nutrition/diary/goal/application/services/set-diary-goal-day.service";
import {
  DiaryGoalForm,
  DiaryGoalFormService,
} from "@nutrition/diary/goal/application/services/diary-goal-form.service";

type PickerTab = "product" | "recipe" | "quick";

@Component({
  selector: "app-get-diary",
  templateUrl: "./get-diary.component.html",
  styleUrls: ["./get-diary.component.css"],
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    DiarySummaryComponent,
    DiaryEntryComponent,
    MacroBadgesComponent,
    EmojiTileComponent,
    TextComponent,
    HeadingComponent,
    ButtonComponent,
    IconButtonComponent,
    PlaceholderNoteComponent,
    CardComponent,
    StackComponent,
    SkeletonSummaryComponent,
    SkeletonSectionHeaderComponent,
    SkeletonListComponent,
    ModalSheetComponent,
    ChoiceRowComponent,
    SearchInputComponent,
    SegmentedToggleComponent,
    NutrientInputComponent,
    NumberInputComponent,
    TextInputComponent,
    AmountInputComponent,
    EmojiChoiceGridComponent,
    NoteComponent,
    IconComponent,
    ChipComponent,
    CalendarComponent,
    DiaryTreeComponent,
    SaveStatusComponent,
  ],
})
export class GetDiaryComponent implements OnInit {
  private translationService = inject(TranslationService);
  private getDiaryService = inject(GetDiaryService);
  private getDiaryCalendarService = inject(GetDiaryCalendarService);
  private getArticlesService = inject(GetArticlesService);
  private getRecipesService = inject(GetRecipesService);
  private createDiaryEntryService = inject(CreateDiaryEntryService);
  private updateDiaryEntryService = inject(UpdateDiaryEntryService);
  private updateDiaryEntryNodeService = inject(UpdateDiaryEntryNodeService);
  private resetDiaryEntryTreeService = inject(ResetDiaryEntryTreeService);
  private assignDiaryEntryLotService = inject(AssignDiaryEntryLotService);
  private getRecipeLotsService = inject(GetRecipeLotsService);
  private lotView = inject(DiaryLotViewService);
  private deleteDiaryEntryService = inject(DeleteDiaryEntryService);
  private consumeDiaryMealService = inject(ConsumeDiaryMealService);
  private treeView = inject(DiaryTreeViewService);
  private entityVisual = inject(EntityVisualService);
  private createQuickDiaryEntryService = inject(CreateQuickDiaryEntryService);
  private updateQuickDiaryEntryService = inject(UpdateQuickDiaryEntryService);
  protected quickForms = inject(QuickDiaryEntryFormService);
  private updateDiaryGoalService = inject(UpdateDiaryGoalService);
  private setDiaryGoalDayService = inject(SetDiaryGoalDayService);
  protected goalForm = inject(DiaryGoalFormService);
  protected view = inject(DiaryViewService);
  protected calendarView = inject(DiaryCalendarViewService);
  protected picker = inject(DiaryPickerService);
  private destroyRef = inject(DestroyRef);
  protected autosave = inject(AutosaveService);
  protected undo = inject(UndoService);

  private readonly MODULE_PATH = "nutrition/diary/diary";

  readonly skeletonMeals = [2, 2, 1, 1];

  loading = signal(true);
  loadedDay = signal<DiaryDay | null>(null);
  date = signal(this.view.todayIso());

  day = computed<DiaryDay | null>(() => {
    const removedId = this.undo.removedId();
    const loadedDay = this.loadedDay();
    if (!removedId) return loadedDay;

    return this.view.withoutEntry(loadedDay, removedId);
  });

  pickerOpen = signal(false);
  pickerMeal = signal("");
  pickerTab = signal<PickerTab>("product");
  pickerQuery = signal("");
  pickerTabs = computed<SegmentedOption[]>(() => [
    { value: "product", label: this.t("getDiary.picker.products") },
    { value: "recipe", label: this.t("getDiary.picker.recipes") },
    { value: "quick", label: this.t("getDiary.picker.quick") },
  ]);

  attributes = computed(() => this.day()?.attributes ?? null);
  planningDay = computed(() => this.view.isFuture(this.date()));
  pastDay = computed(() => this.view.isPast(this.date()));
  summaryEyebrowKey = computed(() =>
    this.planningDay() ? "getDiary.summary.planned" : "getDiary.summary.total",
  );

  quickForm = signal<QuickDiaryEntryForm>(this.quickForms.empty());
  quickEditingId = signal<string | null>(null);
  quickQuantity = signal(1);
  quickSaving = signal(false);

  quickEditing = computed(() => this.quickEditingId() !== null);
  quickValid = computed(() => this.quickForms.isValid(this.quickForm()));
  quickSubmitLabel = computed(() =>
    this.quickEditing() ? "getDiary.quick.save" : "getDiary.quick.submit",
  );
  pickerTitle = computed(() =>
    this.quickEditing() ? "getDiary.quick.editTitle" : "getDiary.picker.title",
  );

  pickerChoices = computed<DiaryChoice[]>(() =>
    this.pickerTab() === "recipe"
      ? this.picker.recipeChoices(this.pickerQuery())
      : this.picker.productChoices(this.pickerQuery()),
  );

  pickerRows = computed(() =>
    this.pickerChoices().map((choice) => ({
      choice,
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Diary,
        this.entityVisual.kindOf(choice.kind),
        choice.refId,
        choice.image,
      ),
      kcal: this.choiceKcal(choice),
      macros: this.choiceMacros(choice),
    })),
  );

  pickerMealLabel = computed(() =>
    this.pickerMeal() ? this.mealLabel(this.pickerMeal()) : "",
  );

  lotEntryId = signal<string | null>(null);
  lotNodePath = signal<string | null>(null);
  lotSelectedId = signal<string | null>(null);
  lotRows = signal<DiaryLotRow[]>([]);
  lotLoading = signal(false);
  lotSaving = signal(false);

  lotOpen = computed(() => null !== this.lotEntryId());

  lotLabels = computed<DiaryLotLabels>(() => ({
    untitled: this.t("getDiary.lot.untitled"),
    left: (servings: string) => this.t("getDiary.lot.left", { servings }),
    gone: this.t("getDiary.lot.gone"),
    changed: this.t("getDiary.lot.changed"),
  }));

  expandedEntries = signal<ReadonlySet<string>>(new Set());
  collapsedNodes = signal<ReadonlySet<string>>(new Set());

  treeLabels = computed(() => ({
    ...this.macroLabels(),
    kcal: this.t("getDiary.kcal"),
    servings: this.t("getDiary.tree.servings"),
    lotNone: this.t("getDiary.lot.none"),
  }));

  mealRows = computed(() =>
    (this.attributes()?.meals ?? []).map((meal) => ({
      key: meal.key,
      label: this.mealLabel(meal.key),
      meta: this.view.mealMeta(meal),
      consumed: meal.consumed,
      partial: !meal.consumed && meal.entries.some((entry) => entry.consumed),
      consumable: meal.entries.length > 0,
      consumeLabel: this.mealConsumeLabel(meal),
      entries: meal.entries.map((entry) => ({
        entry,
        imageUrl: this.entityVisual.urlOf(
          VisualSurface.Diary,
          this.entityVisual.kindOf(entry.kind),
          entry.refId,
          entry.image,
        ),
        badge: this.badgeLabel(entry.kind),
        badgeTone: this.view.entryBadgeTone(entry.kind),
        kcalLabel: `${this.view.integer(entry.macros.calories)} ${this.t("getDiary.kcal")}`,
        macros: this.entryMacros(entry),
        unit: this.view.entryUnitLabel(entry),
        unitValue: entry.unit,
        unitOptions:
          "product" === entry.kind && entry.refId
            ? this.picker.unitOptions(entry.refId)
            : [],
        openable: "quick" === entry.kind,
        expandable: entry.tree.length > 0,
        expanded: this.expandedEntries().has(entry.id),
        treeRows: this.expandedEntries().has(entry.id)
          ? this.treeView.rows(
              entry.tree,
              this.collapsedNodes(),
              this.treeLabels(),
              0,
              null !== entry.lot,
            )
          : [],
        showReset: entry.customized,
        lotPickable: "recipe" === entry.kind && null !== entry.refId,
        lotLabel: this.lotView.entryLabel(entry.lot, this.treeLabels().lotNone),
        stockLabel: this.stockLabel(entry),
        stockTone:
          DiaryStockState.Covered === entry.stockState
            ? ("brand" as const)
            : ("neutral" as const),
      })),
    })),
  );

  calendarOpen = signal(false);
  calendarMonth = signal(this.calendarView.monthOf(this.view.todayIso()));
  calendarDays = signal<DiaryCalendarDay[]>([]);

  calendarMonthLabel = computed(() =>
    this.calendarView.monthLabel(this.calendarMonth()),
  );
  calendarWeekdays = this.calendarView.weekdays();
  calendarCells = computed<CalendarCell[]>(() =>
    this.calendarView.buildCells(
      this.calendarMonth(),
      this.calendarDays(),
      this.date(),
      this.view.todayIso(),
    ),
  );
  calendarLegend = computed<CalendarLegendItem[]>(() =>
    this.calendarView.legend({
      green: this.t("getDiary.calendar.legend.green"),
      orange: this.t("getDiary.calendar.legend.orange"),
      red: this.t("getDiary.calendar.legend.red"),
      rest: this.t("getDiary.calendar.legend.rest"),
      planned: this.t("getDiary.calendar.legend.planned"),
    }),
  );

  dayStatus = computed<DiaryCalendarStatus | null>(() => {
    const diary = this.attributes();
    if (!diary) return null;

    return this.calendarView.dayStatus(
      diary.consumedCalories,
      diary.goalCalories,
      diary.entryCount,
    );
  });
  dayStatusLabel = computed(() => {
    const status = this.dayStatus();
    if (!status) return "";

    if (!this.planningDay())
      return this.t(`getDiary.calendar.legend.${status}`);

    return this.t(
      status === "rest"
        ? "getDiary.calendar.legend.unplanned"
        : "getDiary.calendar.legend.planned",
    );
  });

  goalSheetOpen = signal(false);
  goalSaving = signal(false);
  goal = signal<DiaryGoalForm>({
    calories: 0,
    proteinPct: 0,
    fatPct: 0,
    carbsPct: 0,
  });
  goalSeed = signal<DiaryGoalForm>({
    calories: 0,
    proteinPct: 0,
    fatPct: 0,
    carbsPct: 0,
  });

  goalTitleKey = computed(() =>
    this.pastDay() ? "getDiary.goal.titleDay" : "getDiary.goal.title",
  );
  goalSubtitle = computed(() =>
    this.pastDay()
      ? this.view.dateLine(this.date())
      : this.t("getDiary.goal.subtitle"),
  );

  goalProteinGrams = computed(() =>
    this.goalForm.grams(
      this.goal().calories,
      this.goal().proteinPct,
      "protein",
    ),
  );
  goalFatGrams = computed(() =>
    this.goalForm.grams(this.goal().calories, this.goal().fatPct, "fat"),
  );
  goalCarbsGrams = computed(() =>
    this.goalForm.grams(this.goal().calories, this.goal().carbsPct, "carbs"),
  );
  goalPercentTotal = computed(() => this.goalForm.percentTotal(this.goal()));
  goalValid = computed(() => this.goalForm.isValid(this.goal()));

  mealConsumeLabel(meal: DiaryMealView): string {
    if (meal.consumed || meal.entries.some((entry) => entry.consumed)) {
      return this.t("getDiary.meal.unmark");
    }

    return this.t("getDiary.meal.markEaten");
  }

  stockLabel(entry: DiaryEntryView): string {
    if (DiaryEntryKind.Recipe !== entry.kind || entry.consumed) return "";

    if (DiaryStockState.Covered === entry.stockState) {
      return this.t("getDiary.stock.covered");
    }

    if (DiaryStockState.Short === entry.stockState) {
      return this.t("getDiary.stock.short");
    }

    return "";
  }

  onConsumeMeal(mealKey: string, consumed: boolean): void {
    const previous = this.loadedDay();
    if (!previous) return;

    this.loadedDay.set(this.view.withMealConsumed(previous, mealKey, consumed));

    this.consumeDiaryMealService
      .consumeDiaryMeal(this.date(), mealKey, consumed)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.load(this.date(), true),
        error: () => this.loadedDay.set(previous),
      });
  }

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.loadChoices();
        this.load(this.date());
      });
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  macroLabels = computed<MacroShortLabels>(() => ({
    protein: this.t("getDiary.macro.protein"),
    fat: this.t("getDiary.macro.fat"),
    carbs: this.t("getDiary.macro.carbs"),
  }));

  choiceKcal(choice: DiaryChoice): string {
    return `${this.view.integer(choice.macros.calories)} ${this.t("getDiary.kcal")}`;
  }

  choiceMacros(choice: DiaryChoice): MacroBadge[] {
    return this.view.macroItems(choice.macros, this.macroLabels());
  }

  entryMacros(entry: DiaryEntryView): MacroBadge[] {
    return this.view.macroItems(entry.macros, this.macroLabels());
  }

  badgeLabel(kind: DiaryEntryKind): string {
    if (DiaryEntryKind.Recipe === kind) return this.t("getDiary.badge.recipe");
    if (DiaryEntryKind.Quick === kind) return this.t("getDiary.badge.quick");

    return this.t("getDiary.badge.product");
  }

  mealLabel(key: string): string {
    return this.t(`getDiary.meals.${key}`);
  }

  previousDay(): void {
    this.load(this.view.addDays(this.date(), -1));
  }

  nextDay(): void {
    this.load(this.view.addDays(this.date(), 1));
  }

  goToday(): void {
    if (this.view.isToday(this.date())) return;

    this.load(this.view.todayIso());
  }

  openCalendar(): void {
    this.calendarMonth.set(this.calendarView.monthOf(this.date()));
    this.calendarOpen.set(true);
    this.loadCalendar();
  }

  closeCalendar(): void {
    this.calendarOpen.set(false);
  }

  calendarPreviousMonth(): void {
    this.calendarMonth.set(
      this.calendarView.shiftMonth(this.calendarMonth(), -1),
    );
    this.loadCalendar();
  }

  calendarNextMonth(): void {
    this.calendarMonth.set(
      this.calendarView.shiftMonth(this.calendarMonth(), 1),
    );
    this.loadCalendar();
  }

  onCalendarDay(date: string): void {
    this.calendarOpen.set(false);
    this.load(date);
  }

  private loadCalendar(): void {
    this.getDiaryCalendarService
      .getDiaryCalendar(this.calendarMonth())
      .subscribe({
        next: (response) =>
          this.calendarDays.set(response.data.attributes.days),
      });
  }

  openPicker(mealKey: string): void {
    this.pickerMeal.set(mealKey);
    this.pickerTab.set("product");
    this.pickerQuery.set("");
    this.resetQuickForm();
    this.pickerOpen.set(true);
  }

  openQuickEditor(mealKey: string, entry: DiaryEntryView): void {
    if (entry.kind !== "quick") return;

    this.pickerMeal.set(mealKey);
    this.pickerTab.set("quick");
    this.quickForm.set(this.quickForms.fromEntry(entry));
    this.quickEditingId.set(entry.id);
    this.quickQuantity.set(entry.quantity);
    this.pickerOpen.set(true);
  }

  closePicker(): void {
    this.pickerOpen.set(false);
    this.resetQuickForm();
  }

  onQuickField(field: keyof QuickDiaryEntryForm, value: string): void {
    this.quickForm.update((form) => ({ ...form, [field]: value }));
  }

  submitQuick(): void {
    if (!this.quickValid() || this.quickSaving()) return;

    const payload = this.quickForms.toPayload(
      this.quickForm(),
      this.quickQuantity(),
    );
    const editingId = this.quickEditingId();
    const request$ = editingId
      ? this.updateQuickDiaryEntryService.updateQuickDiaryEntry(
          editingId,
          payload,
        )
      : this.createQuickDiaryEntryService.createQuickDiaryEntry({
          ...payload,
          entryDate: this.date(),
          meal: this.pickerMeal(),
        });

    this.quickSaving.set(true);

    request$.subscribe({
      next: () => {
        this.quickSaving.set(false);
        this.closePicker();
        this.load(this.date());
      },
      error: () => this.quickSaving.set(false),
    });
  }

  private resetQuickForm(): void {
    this.quickForm.set(this.quickForms.empty());
    this.quickEditingId.set(null);
    this.quickQuantity.set(1);
    this.quickSaving.set(false);
  }

  onPickerTab(tab: string): void {
    this.pickerTab.set(tab as PickerTab);
    this.pickerQuery.set("");
  }

  onPickerSearch(query: string): void {
    this.pickerQuery.set(query);
  }

  onPick(choice: DiaryChoice): void {
    this.closePicker();

    const defaults =
      choice.kind === "product"
        ? this.picker.productDefaults(choice.refId)
        : this.picker.recipeDefaults();

    this.createDiaryEntryService
      .createDiaryEntry({
        entryDate: this.date(),
        meal: this.pickerMeal(),
        kind: choice.kind,
        refId: choice.refId,
        quantity: defaults.quantity,
        unit: choice.kind === "product" ? defaults.unit : null,
      })
      .subscribe({
        next: () => this.load(this.date()),
      });
  }

  onQuantityChange(entryId: string, quantity: number): void {
    if (!quantity || quantity <= 0) return;

    this.autosave.push(`entry:${entryId}`, () =>
      this.updateDiaryEntryService
        .updateDiaryEntryQuantity(entryId, quantity)
        .pipe(tap(() => this.load(this.date(), true))),
    );
  }

  onRetrySave(): void {
    this.autosave.retry();
  }

  onEntryUnitChange(entry: DiaryEntryView, unit: string): void {
    this.updateDiaryEntryService
      .updateDiaryEntryQuantity(entry.id, entry.quantity, unit)
      .subscribe({ next: () => this.load(this.date(), true) });
  }

  onNodeQuantityChange(entryId: string, change: DiaryTreeQuantityChange): void {
    if (!change.quantity || change.quantity <= 0) return;

    this.autosave.push(`node:${entryId}:${change.path}`, () =>
      this.updateDiaryEntryNodeService
        .updateDiaryEntryNode(entryId, change.path, change.quantity)
        .pipe(tap(() => this.load(this.date(), true))),
    );
  }

  onNodeUnitChange(entryId: string, change: DiaryTreeUnitChange): void {
    this.updateDiaryEntryNodeService
      .updateDiaryEntryNode(entryId, change.path, change.quantity, change.unit)
      .subscribe({ next: () => this.load(this.date(), true) });
  }

  onResetTree(entryId: string): void {
    this.resetDiaryEntryTreeService.resetDiaryEntryTree(entryId).subscribe({
      next: () => this.load(this.date(), true),
    });
  }

  openNodeLotPicker(entryId: string, path: string): void {
    const entry = this.entryOf(entryId);
    const node = entry ? this.treeView.findNode(entry.tree, path) : null;

    if (null === node) return;

    this.lotNodePath.set(path);
    this.showLotPicker(entryId, node.refId, node.lot?.productionItemId ?? null);
  }

  openLotPicker(entryId: string, recipeId: string | null): void {
    this.lotNodePath.set(null);
    this.showLotPicker(entryId, recipeId, this.lotOf(entryId));
  }

  private showLotPicker(
    entryId: string,
    recipeId: string | null,
    selectedId: string | null,
  ): void {
    if (null === recipeId) return;

    this.lotEntryId.set(entryId);
    this.lotSelectedId.set(selectedId);
    this.lotRows.set([]);
    this.lotLoading.set(true);

    this.getRecipeLotsService
      .getRecipeLots(recipeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.lotRows.set(
            this.lotView.rows(
              response.data,
              this.lotSelectedId(),
              this.lotLabels(),
            ),
          );
          this.lotLoading.set(false);
        },
        error: () => this.lotLoading.set(false),
      });
  }

  closeLotPicker(): void {
    this.lotEntryId.set(null);
    this.lotNodePath.set(null);
    this.lotRows.set([]);
  }

  onPickLot(productionItemId: string | null): void {
    const entryId = this.lotEntryId();
    if (null === entryId || this.lotSaving()) return;

    const nodePath = this.lotNodePath();
    this.lotSaving.set(true);

    this.assignment(entryId, nodePath, productionItemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.lotSaving.set(false);
          this.closeLotPicker();
          this.load(this.date(), true);
        },
        error: () => this.lotSaving.set(false),
      });
  }

  private assignment(
    entryId: string,
    nodePath: string | null,
    productionItemId: string | null,
  ): Observable<void> {
    if (null === nodePath) {
      return this.assignDiaryEntryLotService.assignDiaryEntryLot(
        entryId,
        productionItemId,
      );
    }

    return this.assignDiaryEntryLotService.assignDiaryEntryNodeLot(
      entryId,
      nodePath,
      productionItemId,
    );
  }

  private entryOf(entryId: string): DiaryEntryView | null {
    return (
      (this.attributes()?.meals ?? [])
        .flatMap((meal) => meal.entries)
        .find((entry) => entry.id === entryId) ?? null
    );
  }

  private lotOf(entryId: string): string | null {
    return this.entryOf(entryId)?.lot?.productionItemId ?? null;
  }

  toggleEntryTree(entryId: string): void {
    this.expandedEntries.update((expanded) => this.toggled(expanded, entryId));
  }

  toggleTreeNode(path: string): void {
    this.collapsedNodes.update((collapsed) => this.toggled(collapsed, path));
  }

  private toggled(
    source: ReadonlySet<string>,
    key: string,
  ): ReadonlySet<string> {
    const next = new Set(source);
    if (next.has(key)) {
      next.delete(key);

      return next;
    }

    next.add(key);

    return next;
  }

  onRemove(entryId: string): void {
    const entry = this.view.findEntry(this.day(), entryId);
    if (!entry) return;

    this.undo.schedule({
      id: entryId,
      keyTranslation: "getDiary.removed",
      details: { name: entry.name },
      commit: () => this.commitRemoveEntry(entryId),
    });
  }

  private commitRemoveEntry(entryId: string): void {
    this.loadedDay.update((day) => this.view.withoutEntry(day, entryId));

    this.autosave.push(`entry:${entryId}`, () =>
      this.deleteDiaryEntryService
        .deleteDiaryEntry(entryId)
        .pipe(tap(() => this.load(this.date(), true))),
    );
  }

  openGoalSheet(): void {
    const goals = this.attributes()?.goals;
    if (!goals) return;

    const form = this.goalForm.toForm(goals);
    this.goal.set(form);
    this.goalSeed.set(form);
    this.goalSheetOpen.set(true);
  }

  closeGoalSheet(): void {
    this.goalSheetOpen.set(false);
  }

  onGoalCalories(calories: number): void {
    this.goal.update((form) => ({ ...form, calories: Math.max(0, calories) }));
  }

  onGoalProtein(percent: number): void {
    this.goal.update((form) => ({
      ...form,
      proteinPct: this.clampPercent(percent),
    }));
  }

  onGoalFat(percent: number): void {
    this.goal.update((form) => ({
      ...form,
      fatPct: this.clampPercent(percent),
    }));
  }

  onGoalCarbs(percent: number): void {
    this.goal.update((form) => ({
      ...form,
      carbsPct: this.clampPercent(percent),
    }));
  }

  saveGoals(): void {
    if (!this.goalValid() || this.goalSaving()) return;

    const config = this.goalForm.toConfig(this.goal());
    const request$ = this.pastDay()
      ? this.setDiaryGoalDayService.setDiaryGoalDay(this.date(), config)
      : this.updateDiaryGoalService.updateDiaryGoal(config);

    this.goalSaving.set(true);

    request$.subscribe({
      next: () => {
        this.goalSaving.set(false);
        this.goalSheetOpen.set(false);
        this.load(this.date());
      },
      error: () => this.goalSaving.set(false),
    });
  }

  private clampPercent(percent: number): number {
    return Math.min(100, Math.max(0, Math.round(percent)));
  }

  private loadChoices(): void {
    this.getArticlesService.getArticles(1, 200).subscribe({
      next: (response) => this.picker.setProducts(response.data),
    });
    this.getRecipesService.getRecipes(1, 200).subscribe({
      next: (response) => this.picker.setRecipes(response.data),
    });
  }

  private load(date: string, silent = false): void {
    this.date.set(date);
    if (!silent) this.loading.set(true);

    this.getDiaryService.getDiary(date).subscribe({
      next: (response) => {
        this.loadedDay.set(response.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
