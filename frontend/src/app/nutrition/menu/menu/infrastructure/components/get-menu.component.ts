import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, debounceTime, switchMap } from "rxjs";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { SelectComponent } from "@shared/design-system/select/infrastructure/components/select.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { SwipeToDeleteComponent } from "@shared/design-system/swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { PlaceholderNoteComponent } from "@shared/design-system/placeholder-note/infrastructure/components/placeholder-note.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import {
  SegmentedToggleComponent,
  SegmentedOption,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonMacroBarsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-macro-bars.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { SkeletonChipsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-chips.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { MacroPanelComponent } from "@shared/design-system/macro-panel/infrastructure/components/macro-panel.component";
import { MacroBadgesComponent } from "@shared/design-system/macro-badges/infrastructure/components/macro-badges.component";
import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";
import { WeekDayTabsComponent } from "@shared/design-system/week-day-tabs/infrastructure/components/week-day-tabs.component";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { DiaryGoalConfig } from "@nutrition/diary/goal/domain/models/diary-goal.model";
import { GetDiaryGoalService } from "@nutrition/diary/goal/application/services/get-diary-goal.service";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
import { GetRecipesService } from "@nutrition/recipe/recipe/application/services/get-recipes.service";
import { GetMenuService } from "@nutrition/menu/menu/application/services/get-menu.service";
import { UpdateMenuService } from "@nutrition/menu/menu/application/services/update-menu.service";
import { DeleteMenuService } from "@nutrition/menu/menu/application/services/delete-menu.service";
import { DuplicateMenuService } from "@nutrition/menu/menu/application/services/duplicate-menu.service";
import {
  MacroLabels,
  MenuViewService,
} from "@nutrition/menu/menu/application/services/menu-view.service";
import { MenuEditorService } from "@nutrition/menu/menu/application/services/menu-editor.service";
import {
  MenuDraft,
  MenuDraftService,
} from "@nutrition/menu/menu/application/services/menu-draft.service";
import { CreateMenuService } from "@nutrition/menu/menu/application/services/create-menu.service";
import { GetMenusService } from "@nutrition/menu/menu/application/services/get-menus.service";
import {
  MenuChoice,
  MenuPickerService,
} from "@nutrition/menu/menu/application/services/menu-picker.service";
import {
  MenuDetailAttributes,
  MenuItemView,
  MenuMacros,
  MenuMealKey,
  MenuType,
  MenuWeekDayKey,
} from "@nutrition/menu/menu/domain/models/menu.model";
import { UpdateMenuRequest } from "@nutrition/menu/menu/domain/models/write-menu.model";
import { MenuLoadSheetComponent } from "./menu-load-sheet.component";
import { MenuApplyWeekSheetComponent } from "./menu-apply-week-sheet.component";
import { MenuShoppingSheetComponent } from "./menu-shopping-sheet.component";

type PickerTab = "product" | "recipe";

@Component({
  selector: "app-get-menu",
  templateUrl: "./get-menu.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    StackComponent,
    CardComponent,
    TextComponent,
    HeadingComponent,
    ButtonComponent,
    IconButtonComponent,
    EmojiTileComponent,
    TextInputComponent,
    NumberInputComponent,
    SelectComponent,
    FieldComponent,
    ChipComponent,
    NoteComponent,
    SwipeToDeleteComponent,
    PlaceholderNoteComponent,
    SearchInputComponent,
    SegmentedToggleComponent,
    ModalSheetComponent,
    SkeletonScreenHeaderComponent,
    SkeletonListComponent,
    SkeletonMacroBarsComponent,
    SkeletonSectionHeaderComponent,
    SkeletonChipsComponent,
    SkeletonLineComponent,
    SkeletonComponent,
    ConfirmActionModalComponent,
    MacroPanelComponent,
    MacroBadgesComponent,
    WeekDayTabsComponent,
    MenuLoadSheetComponent,
    MenuApplyWeekSheetComponent,
    MenuShoppingSheetComponent,
  ],
})
export class GetMenuComponent implements OnInit {
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private authSession = inject(AuthSessionService);
  private getMenuService = inject(GetMenuService);
  private getMenusService = inject(GetMenusService);
  private createMenuService = inject(CreateMenuService);
  private updateMenuService = inject(UpdateMenuService);
  private deleteMenuService = inject(DeleteMenuService);
  private duplicateMenuService = inject(DuplicateMenuService);
  private getArticlesService = inject(GetArticlesService);
  private getRecipesService = inject(GetRecipesService);
  private getDiaryGoalService = inject(GetDiaryGoalService);
  private editor = inject(MenuEditorService);
  private drafts = inject(MenuDraftService);
  private destroyRef = inject(DestroyRef);
  protected view = inject(MenuViewService);
  protected picker = inject(MenuPickerService);

  private readonly MODULE_PATH = "nutrition/menu/menu";
  private readonly TEXT_DEBOUNCE = 600;
  private readonly QUANTITY_DEBOUNCE = 500;

  readonly id = input<string>("");
  readonly draftRoute = input<boolean>(false);
  readonly type = input<MenuType | undefined>(undefined);

  private textChanges = new Subject<UpdateMenuRequest>();
  private quantityChanges = new Subject<UpdateMenuRequest>();

  canWrite = computed(() => this.authSession.isGod());

  loading = signal(true);
  goal = signal<DiaryGoalConfig | null>(null);
  draft = signal<MenuDraft | null>(null);
  loadedDetail = signal<MenuDetailAttributes | null>(null);
  saving = signal(false);
  selectedDayKey = signal<MenuWeekDayKey | null>(null);
  name = signal("");
  note = signal("");

  pickerOpen = signal(false);
  pickerMeal = signal<MenuMealKey | null>(null);
  pickerTab = signal<PickerTab>("product");
  pickerQuery = signal("");
  pickerTabs = computed<SegmentedOption[]>(() => [
    { value: "product", label: this.t("getMenu.picker.products") },
    { value: "recipe", label: this.t("getMenu.picker.recipes") },
  ]);

  loadSheetMenuId = signal<string | null>(null);
  applyWeekMenuId = signal<string | null>(null);
  shoppingMenuId = signal<string | null>(null);
  deleteAsked = signal(false);
  deleting = signal(false);

  readonly skeletonMeals = [2, 2, 1, 1];

  skeletonWeek = signal(false);

  isDraft = computed(() => this.draft() !== null);

  detail = computed<MenuDetailAttributes | null>(() => {
    const draft = this.draft();

    return draft ? this.drafts.toDetail(draft) : this.loadedDetail();
  });

  draftSavable = computed(() => {
    const draft = this.draft();

    return draft !== null && this.drafts.isSavable(draft);
  });

  isWeek = computed(() => this.detail()?.type === "week");

  typeLabel = computed(() =>
    this.t(this.isWeek() ? "getMenu.type.week" : "getMenu.type.single"),
  );

  dayTabs = computed(() => {
    const detail = this.detail();
    if (!detail) return [];

    return this.view.dayTabs(detail, this.selectedDayKey(), this.dayLabels());
  });

  currentDay = computed(() => {
    const detail = this.detail();
    if (!detail) return null;

    return this.view.findDay(detail, this.selectedDayKey());
  });

  mealRows = computed(() =>
    (this.currentDay()?.meals ?? []).map((meal) => ({
      key: meal.key,
      label: this.mealLabel(meal.key),
      meta: this.mealMeta(meal.totals.calories, meal.itemCount),
      items: meal.items.map((item) => ({
        item,
        trackKey: this.view.itemKey(item),
        badge: this.itemBadge(item),
        kcal: this.itemKcal(item),
        macros: this.itemMacros(item),
        unitLabel: this.itemUnitLabel(item),
        unitOptions: this.itemUnitOptions(item),
        quantityLabel: this.view.itemQuantityLabel(
          item,
          this.itemUnitLabel(item),
        ),
      })),
    })),
  );

  pickerRows = computed(() =>
    this.pickerChoices().map((choice) => ({
      choice,
      kcal: this.choiceKcal(choice),
      macros: this.choiceMacros(choice),
    })),
  );

  activeDaysLabel = computed(() => {
    const detail = this.detail();
    if (!detail) return "";

    const count = detail.weekDays.length;
    const days =
      count === 1
        ? this.t("getMenu.week.activeDays.one")
        : this.translate("getMenu.week.activeDays.many", { count });
    const kcal = this.translate("getMenu.week.kcalPerDay", {
      kcal: this.view.integer(detail.perDay.calories),
    });

    return `${days} · ${kcal}`;
  });

  private dayTotals = computed<MenuMacros>(
    () =>
      this.currentDay()?.totals ?? {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
  );

  totalsKcal = computed(() => this.view.integer(this.dayTotals().calories));

  goalKcal = computed(() => {
    const goal = this.goal();

    return goal ? this.view.integer(goal.calories) : "";
  });

  exceedsCalories = computed(
    () =>
      this.view.excess(this.dayTotals().calories, this.goal()?.calories) > 0,
  );

  caloriesFootnote = computed(() => {
    const goal = this.goal();
    if (!goal) return this.t("getMenu.kcal");

    const calories = this.dayTotals().calories;
    const excess = this.view.excess(calories, goal.calories);

    if (excess > 0) {
      return this.translate("getMenu.totals.exceeded", {
        kcal: this.view.integer(excess),
      });
    }

    return this.translate("getMenu.totals.remaining", {
      kcal: this.view.integer(this.view.remaining(calories, goal.calories)),
    });
  });

  goalMacros = computed(() =>
    this.view.goalMacros(this.dayTotals(), this.goal(), {
      protein: this.t("getMenu.totals.protein"),
      fat: this.t("getMenu.totals.fat"),
      carbs: this.t("getMenu.totals.carbs"),
    }),
  );

  macroLabels = computed<MacroLabels>(() => ({
    protein: this.t("getMenu.macro.protein"),
    fat: this.t("getMenu.macro.fat"),
    carbs: this.t("getMenu.macro.carbs"),
  }));

  currentDayEmpty = computed(() => (this.currentDay()?.itemCount ?? 0) === 0);

  primaryLabel = computed(() =>
    this.t(this.isWeek() ? "getMenu.actions.applyDay" : "getMenu.actions.load"),
  );

  pickerTitle = computed(() =>
    this.translate("getMenu.picker.title", {
      meal: this.pickerMeal() ? this.mealLabel(this.pickerMeal()!) : "",
    }),
  );

  pickerChoices = computed<MenuChoice[]>(() =>
    this.pickerTab() === "recipe"
      ? this.picker.recipeChoices(this.pickerQuery())
      : this.picker.productChoices(this.pickerQuery()),
  );

  pickerSearchPlaceholder = computed(() =>
    this.t(
      this.pickerTab() === "recipe"
        ? "getMenu.picker.searchRecipes"
        : "getMenu.picker.searchProducts",
    ),
  );

  constructor() {
    toObservable(this.id)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.startFromRoute());
  }

  private startFromRoute(): void {
    if (this.draftRoute()) {
      this.startDraft(this.type() ?? "single");

      return;
    }

    this.load();
  }

  ngOnInit(): void {
    this.textChanges
      .pipe(
        debounceTime(this.TEXT_DEBOUNCE),
        switchMap((request) =>
          this.updateMenuService.updateMenu(this.id(), request),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({ next: () => this.load(true) });

    this.quantityChanges
      .pipe(
        debounceTime(this.QUANTITY_DEBOUNCE),
        switchMap((request) =>
          this.updateMenuService.updateMenu(this.id(), request),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({ next: () => this.load(true) });

    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.loadChoices();
        this.loadGoal();
      });
  }

  t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  mealLabel(meal: MenuMealKey): string {
    return this.t(`getMenu.meals.${meal}`);
  }

  mealMeta(calories: number, count: number): string {
    if (count === 0) return this.t("getMenu.items.zero");

    const items =
      count === 1
        ? this.t("getMenu.items.one")
        : this.translate("getMenu.items.many", { count });

    return this.translate("getMenu.meal.meta", {
      kcal: this.view.integer(calories),
      count: items,
    });
  }

  itemBadge(item: MenuItemView): string {
    return this.t(
      item.kind === "recipe" ? "getMenu.badge.recipe" : "getMenu.badge.product",
    );
  }

  choiceKcal(choice: MenuChoice): string {
    return `${this.view.integer(choice.macros.calories)} ${this.t("getMenu.kcal")}`;
  }

  choiceMacros(choice: MenuChoice): MacroBadge[] {
    return this.view.itemMacros(choice.macros, this.macroLabels());
  }

  itemKcal(item: MenuItemView): string {
    return `${this.view.integer(item.macros.calories)} ${this.t("getMenu.kcal")}`;
  }

  itemMacros(item: MenuItemView): MacroBadge[] {
    return this.view.itemMacros(item.macros, this.macroLabels());
  }

  itemUnitLabel(item: MenuItemView): string {
    if (item.kind === "recipe") {
      return this.t(
        item.quantity === 1 ? "getMenu.servings.one" : "getMenu.servings.many",
      );
    }

    return this.picker.unitLabel(item.unit ?? item.baseUnit);
  }

  itemUnitOptions(item: MenuItemView): SelectOption[] {
    return this.picker.unitOptions(item.refId, item.baseUnit);
  }

  goBack(): void {
    this.router.navigate(["/menus"]);
  }

  onName(value: string): void {
    if (!this.canWrite()) return;

    this.name.set(value);

    const draft = this.draft();
    if (draft) {
      this.draft.set({ ...draft, name: value });

      return;
    }

    const detail = this.loadedDetail();
    if (!detail) return;

    this.textChanges.next(this.editor.withName(detail, value));
  }

  onNote(value: string): void {
    if (!this.canWrite()) return;

    this.note.set(value);

    const draft = this.draft();
    if (draft) {
      this.draft.set({ ...draft, note: value });

      return;
    }

    const detail = this.loadedDetail();
    if (!detail) return;

    this.textChanges.next(this.editor.withNote(detail, value));
  }

  onSelectDay(dayKey: string): void {
    this.selectedDayKey.set(dayKey as MenuWeekDayKey);
  }

  openPicker(meal: MenuMealKey): void {
    this.pickerMeal.set(meal);
    this.pickerTab.set("product");
    this.pickerQuery.set("");
    this.pickerOpen.set(true);
  }

  closePicker(): void {
    this.pickerOpen.set(false);
  }

  onPickerTab(tab: string): void {
    this.pickerTab.set(tab as PickerTab);
    this.pickerQuery.set("");
  }

  onPickerSearch(query: string): void {
    this.pickerQuery.set(query);
  }

  onPick(choice: MenuChoice): void {
    const meal = this.pickerMeal();
    if (!meal) return;

    const defaults = this.picker.defaults(choice.kind, choice.refId);
    this.closePicker();

    const draft = this.draft();
    if (draft) {
      this.draft.set(
        this.drafts.withItemAdded(
          draft,
          this.selectedDayKey(),
          meal,
          choice.kind,
          choice.refId,
          defaults.quantity,
          defaults.unit,
        ),
      );

      return;
    }

    const detail = this.loadedDetail();
    if (!detail) return;

    this.save(
      this.editor.withItemAdded(
        detail,
        this.selectedDayKey(),
        meal,
        choice.kind,
        choice.refId,
        defaults.quantity,
        defaults.unit,
      ),
    );
  }

  onQuantity(item: MenuItemView, quantity: number): void {
    if (!quantity || quantity <= 0) return;

    const draft = this.draft();
    if (draft) {
      this.draft.set(this.drafts.withItemQuantity(draft, item.id, quantity));

      return;
    }

    const detail = this.loadedDetail();
    if (!detail) return;

    const patched = this.editor.withItemQuantityApplied(
      detail,
      item.id,
      quantity,
    );

    this.loadedDetail.set(patched);
    this.quantityChanges.next(this.editor.toUpdateRequest(patched));
  }

  onUnit(item: MenuItemView, unit: string): void {
    const draft = this.draft();
    if (draft) {
      this.draft.set(this.drafts.withItemUnit(draft, item.id, unit));

      return;
    }

    const detail = this.loadedDetail();
    if (!detail) return;

    this.save(this.editor.withItemUnit(detail, item.id, unit));
  }

  onRemoveItem(item: MenuItemView): void {
    const draft = this.draft();
    if (draft) {
      this.draft.set(this.drafts.withoutItem(draft, item.id));

      return;
    }

    const detail = this.loadedDetail();
    if (!detail) return;

    this.save(this.editor.withoutItem(detail, item.id));
  }

  saveDraft(): void {
    const draft = this.draft();
    if (!draft || !this.draftSavable() || this.saving()) return;

    this.saving.set(true);

    this.createMenuService
      .createMenu(this.drafts.toCreateRequest(draft))
      .subscribe({
        next: () => this.goToSavedMenu(draft.type),
        error: () => this.saving.set(false),
      });
  }

  onPrimaryAction(): void {
    this.loadSheetMenuId.set(this.id());
  }

  onApplyWeek(): void {
    this.applyWeekMenuId.set(this.id());
  }

  onShop(): void {
    this.shoppingMenuId.set(this.id());
  }

  closeLoadSheet(): void {
    this.loadSheetMenuId.set(null);
  }

  closeApplyWeekSheet(): void {
    this.applyWeekMenuId.set(null);
  }

  closeShoppingSheet(): void {
    this.shoppingMenuId.set(null);
  }

  onDuplicate(): void {
    this.duplicateMenuService
      .duplicateMenu(this.id(), { copySuffix: this.t("getMenu.copySuffix") })
      .subscribe({ next: () => this.router.navigate(["/menus"]) });
  }

  askDelete(): void {
    this.deleteAsked.set(true);
  }

  cancelDelete(): void {
    this.deleteAsked.set(false);
  }

  confirmDelete(): void {
    if (this.deleting()) return;

    this.deleting.set(true);

    this.deleteMenuService.deleteMenu(this.id()).subscribe({
      next: () => this.router.navigate(["/menus"]),
      error: () => this.deleting.set(false),
    });
  }

  private translate(key: string, params: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  private startDraft(type: MenuType): void {
    this.draft.set(this.drafts.empty(type));
    this.selectedDayKey.set(type === "week" ? "mon" : null);
    this.name.set("");
    this.note.set("");
    this.loading.set(false);
  }

  private goToSavedMenu(type: MenuType): void {
    this.getMenusService.getMenus(1, 1, undefined, "-createdAt").subscribe({
      next: (response) => {
        this.saving.set(false);

        const saved = response.data[0];
        if (!saved) {
          this.router.navigate(["/menus"]);

          return;
        }

        this.router.navigate(["/menus", saved.id], {
          queryParams: { type },
          replaceUrl: true,
        });
      },
      error: () => this.saving.set(false),
    });
  }

  private dayLabels(): Record<string, string> {
    return this.view.weekDayKeys().reduce<Record<string, string>>(
      (labels, key) => ({
        ...labels,
        [key]: this.t(`getMenu.days.${key}`),
      }),
      {},
    );
  }

  private save(request: UpdateMenuRequest): void {
    this.updateMenuService.updateMenu(this.id(), request).subscribe({
      next: () => this.load(true),
    });
  }

  private loadChoices(): void {
    this.getArticlesService.getArticles(1, 200).subscribe({
      next: (response) => this.picker.setProducts(response.data),
    });
    this.getRecipesService.getRecipes(1, 200).subscribe({
      next: (response) => this.picker.setRecipes(response.data),
    });
  }

  private loadGoal(): void {
    this.getDiaryGoalService.getDiaryGoal().subscribe({
      next: (response) => this.goal.set(response.data.attributes),
    });
  }

  private load(silent = false): void {
    if (!silent) this.loading.set(true);

    this.getMenuService.getMenu(this.id()).subscribe({
      next: (response) => {
        const attributes = response.data.attributes;

        this.loadedDetail.set(attributes);
        this.name.set(attributes.name);
        this.note.set(attributes.note);
        this.syncSelectedDay(attributes);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private syncSelectedDay(detail: MenuDetailAttributes): void {
    if (detail.type !== "week") {
      this.selectedDayKey.set(null);

      return;
    }

    const current = this.selectedDayKey();
    if (current && this.view.weekDayKeys().includes(current)) return;

    this.selectedDayKey.set(this.view.firstPlannedDayKey(detail) ?? "mon");
  }
}
