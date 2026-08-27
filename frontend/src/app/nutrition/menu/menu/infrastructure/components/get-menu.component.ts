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
import { Observable, of, tap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { PlaceholderNoteComponent } from "@shared/design-system/placeholder-note/infrastructure/components/placeholder-note.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import {
  SegmentedToggleComponent,
  SegmentedOption,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
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
import { DiaryEntryComponent } from "@shared/design-system/diary-entry/infrastructure/components/diary-entry.component";
import { DiaryTreeComponent } from "@shared/design-system/diary-tree/infrastructure/components/diary-tree.component";
import {
  DiaryTreeQuantityChange,
  DiaryTreeUnitChange,
} from "@shared/design-system/diary-tree/domain/models/diary-tree-change.model";
import { WeekDayTabsComponent } from "@shared/design-system/week-day-tabs/infrastructure/components/week-day-tabs.component";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { DiaryGoalConfig } from "@nutrition/diary/goal/domain/models/diary-goal.model";
import { GetDiaryGoalService } from "@nutrition/diary/goal/application/services/get-diary-goal.service";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
import { GetRecipesService } from "@nutrition/recipe/recipe/application/services/get-recipes.service";
import { GetMenuService } from "@nutrition/menu/menu/application/services/get-menu.service";
import { DeleteMenuService } from "@nutrition/menu/menu/application/services/delete-menu.service";
import { DuplicateMenuService } from "@nutrition/menu/menu/application/services/duplicate-menu.service";
import { ExportMenuService } from "@nutrition/menu/menu/application/services/export-menu.service";
import {
  MacroLabels,
  MenuViewService,
} from "@nutrition/menu/menu/application/services/menu-view.service";
import { MenuEditorService } from "@nutrition/menu/menu/application/services/menu-editor.service";
import { UpdateMenuDetailsService } from "@nutrition/menu/menu/application/services/update-menu-details.service";
import { SaveMenuItemService } from "@nutrition/menu/menu/application/services/save-menu-item.service";
import { AddMenuItemRequest } from "@nutrition/menu/menu/domain/models/add-menu-item-request.model";
import { AutosaveService } from "@shared/autosave/application/services/autosave.service";
import { UndoService } from "@shared/undo/application/services/undo.service";
import { SaveStatusComponent } from "@shared/design-system/save-status/infrastructure/components/save-status.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { uuidV4 } from "@shared/uuid/uuid";
import {
  MenuDraft,
  MenuDraftService,
} from "@nutrition/menu/menu/application/services/menu-draft.service";
import { CreateMenuService } from "@nutrition/menu/menu/application/services/create-menu.service";
import { UpdateMenuItemNodeService } from "@nutrition/menu/menu/application/services/update-menu-item-node.service";
import { ResetMenuItemTreeService } from "@nutrition/menu/menu/application/services/reset-menu-item-tree.service";
import { MenuTreeViewService } from "@nutrition/menu/menu/application/services/menu-tree-view.service";
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
import { MenuLoadSheetComponent } from "./menu-load-sheet.component";
import { MenuApplyWeekSheetComponent } from "./menu-apply-week-sheet.component";
import { MenuShoppingSheetComponent } from "./menu-shopping-sheet.component";

type PickerTab = "product" | "recipe";

@Component({
  selector: "app-get-menu",
  templateUrl: "./get-menu.component.html",
  imports: [
    RevealDirective,
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    StackComponent,
    CardComponent,
    TextComponent,
    HeadingComponent,
    ButtonComponent,
    IconButtonComponent,
    EmojiTileComponent,
    TextInputComponent,
    NoteComponent,
    PlaceholderNoteComponent,
    SearchInputComponent,
    SegmentedToggleComponent,
    ModalSheetComponent,
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
    DiaryEntryComponent,
    DiaryTreeComponent,
    MenuLoadSheetComponent,
    MenuApplyWeekSheetComponent,
    MenuShoppingSheetComponent,
    SaveStatusComponent,
  ],
})
export class GetMenuComponent implements OnInit {
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private getMenuService = inject(GetMenuService);
  private getMenusService = inject(GetMenusService);
  private createMenuService = inject(CreateMenuService);
  private deleteMenuService = inject(DeleteMenuService);
  private duplicateMenuService = inject(DuplicateMenuService);
  private exportMenuService = inject(ExportMenuService);
  private updateMenuItemNodeService = inject(UpdateMenuItemNodeService);
  private resetMenuItemTreeService = inject(ResetMenuItemTreeService);
  private treeView = inject(MenuTreeViewService);
  private getArticlesService = inject(GetArticlesService);
  private getRecipesService = inject(GetRecipesService);
  private getDiaryGoalService = inject(GetDiaryGoalService);
  private updateMenuDetailsService = inject(UpdateMenuDetailsService);
  private saveMenuItemService = inject(SaveMenuItemService);
  protected autosave = inject(AutosaveService);
  protected undo = inject(UndoService);
  private editor = inject(MenuEditorService);
  private drafts = inject(MenuDraftService);
  private destroyRef = inject(DestroyRef);
  protected view = inject(MenuViewService);
  protected picker = inject(MenuPickerService);

  private readonly MODULE_PATH = "nutrition/menu/menu";

  readonly id = input<string>("");
  readonly draftRoute = input<boolean>(false);
  readonly type = input<MenuType | undefined>(undefined);

  loading = signal(true);
  goal = signal<DiaryGoalConfig | null>(null);
  draft = signal<MenuDraft | null>(null);
  loadedDetail = signal<MenuDetailAttributes | null>(null);
  private readonly pendingItems = new Map<string, AddMenuItemRequest>();
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
  exporting = signal(false);

  readonly skeletonMeals = [2, 2, 1, 1];

  skeletonWeek = signal(false);

  isDraft = computed(() => this.draft() !== null);

  detail = computed<MenuDetailAttributes | null>(() => {
    const draft = this.draft();
    if (draft) return this.drafts.toDetail(draft);

    const loadedDetail = this.loadedDetail();
    const removedId = this.undo.removedId();
    if (!loadedDetail || !removedId) return loadedDetail;

    return this.editor.withoutItemApplied(loadedDetail, removedId);
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

  expandedItems = signal<ReadonlySet<string>>(new Set());
  collapsedNodes = signal<ReadonlySet<string>>(new Set());

  treeLabels = computed(() => ({
    ...this.macroLabels(),
    kcal: this.t("getMenu.kcal"),
    servings: this.t("getMenu.tree.servings"),
  }));

  mealRows = computed(() =>
    (this.currentDay()?.meals ?? []).map((meal) => ({
      key: meal.key,
      label: this.mealLabel(meal.key),
      meta: this.mealMeta(meal.totals.calories, meal.itemCount),
      items: meal.items.map((item) => ({
        item,
        badge: this.itemBadge(item),
        badgeTone: this.itemBadgeTone(item),
        kcal: this.itemKcal(item),
        macros: this.itemMacros(item),
        unitLabel: this.itemUnitLabel(item),
        unitValue: item.unit ?? item.baseUnit,
        unitOptions: item.kind === "product" ? this.itemUnitOptions(item) : [],
        expandable: item.tree.length > 0,
        expanded: this.expandedItems().has(item.id),
        treeRows: this.expandedItems().has(item.id)
          ? this.treeView.rows(
              item.tree,
              this.collapsedNodes(),
              this.treeLabels(),
            )
          : [],
        showReset: item.customized,
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

  itemBadgeTone(item: MenuItemView): "brand" | "neutral" {
    return item.kind === "recipe" ? "brand" : "neutral";
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
    this.name.set(value);

    const draft = this.draft();
    if (draft) {
      this.draft.set({ ...draft, name: value });

      return;
    }

    if (!this.loadedDetail()) return;

    this.queueDetails();
  }

  onNote(value: string): void {
    this.note.set(value);

    const draft = this.draft();
    if (draft) {
      this.draft.set({ ...draft, note: value });

      return;
    }

    if (!this.loadedDetail()) return;

    this.queueDetails();
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

    if (!this.loadedDetail()) return;

    const menuItemId = uuidV4();
    this.pendingItems.set(menuItemId, {
      dayKey: this.selectedDayKey(),
      meal,
      kind: choice.kind,
      refId: choice.refId,
      quantity: defaults.quantity,
      unit: defaults.unit,
    });

    this.autosave.push(this.itemKey(menuItemId), () =>
      this.persistItem(menuItemId),
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
    this.patchPendingItem(item.id, { quantity });
    this.queueItem(item.id);
  }

  onUnit(item: MenuItemView, unit: string): void {
    const draft = this.draft();
    if (draft) {
      this.draft.set(this.drafts.withItemUnit(draft, item.id, unit));

      return;
    }

    const detail = this.loadedDetail();
    if (!detail) return;

    this.loadedDetail.set(
      this.editor.withItemUnitApplied(detail, item.id, unit),
    );
    this.patchPendingItem(item.id, { unit });
    this.queueItem(item.id);
  }

  toggleItemTree(itemId: string): void {
    this.expandedItems.update((expanded) => this.toggled(expanded, itemId));
  }

  toggleTreeNode(path: string): void {
    this.collapsedNodes.update((collapsed) => this.toggled(collapsed, path));
  }

  onNodeQuantityChange(
    item: MenuItemView,
    change: DiaryTreeQuantityChange,
  ): void {
    if (this.isDraft() || !change.quantity || change.quantity <= 0) return;

    this.autosave.push(`node:${item.id}:${change.path}`, () =>
      this.updateMenuItemNodeService
        .updateMenuItemNode(this.id(), item.id, change.path, change.quantity)
        .pipe(tap(() => this.load(true))),
    );
  }

  onNodeUnitChange(item: MenuItemView, change: DiaryTreeUnitChange): void {
    if (this.isDraft()) return;

    this.updateMenuItemNodeService
      .updateMenuItemNode(
        this.id(),
        item.id,
        change.path,
        change.quantity,
        change.unit,
      )
      .subscribe({ next: () => this.load(true) });
  }

  onResetTree(item: MenuItemView): void {
    if (this.isDraft()) return;

    this.resetMenuItemTreeService
      .resetMenuItemTree(this.id(), item.id)
      .subscribe({ next: () => this.load(true) });
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

  onRemoveItem(item: MenuItemView): void {
    const draft = this.draft();
    if (draft) {
      this.draft.set(this.drafts.withoutItem(draft, item.id));

      return;
    }

    if (!this.loadedDetail()) return;

    this.undo.schedule({
      id: item.id,
      keyTranslation: "getMenu.removed",
      details: { name: item.name },
      commit: () => this.commitRemoveItem(item.id),
    });
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

  onExport(): void {
    if (this.exporting()) return;

    this.exporting.set(true);

    this.exportMenuService.exportMenu(this.id()).subscribe({
      next: () => this.exporting.set(false),
      error: () => this.exporting.set(false),
    });
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

  onRetrySave(): void {
    this.autosave.retry();
  }

  private queueDetails(): void {
    this.autosave.push("details", () =>
      this.updateMenuDetailsService.updateMenuDetails(this.id(), {
        name: this.name(),
        emoji: this.loadedDetail()?.emoji ?? "",
        note: this.note(),
      }),
    );
  }

  /**
   * An item edited before its creating PUT has landed must carry the edit in that PUT,
   * not only in a follow-up PATCH the server would reject for a row that does not exist yet.
   */
  private patchPendingItem(
    menuItemId: string,
    patch: Partial<AddMenuItemRequest>,
  ): void {
    const pending = this.pendingItems.get(menuItemId);
    if (!pending) return;

    this.pendingItems.set(menuItemId, { ...pending, ...patch });
  }

  private queueItem(menuItemId: string): void {
    this.autosave.push(this.itemKey(menuItemId), () =>
      this.persistItem(menuItemId),
    );
  }

  /**
   * Resolved when the task runs: an item edited right after being picked coalesces
   * onto the same key and must still land as the creating PUT.
   */
  private persistItem(menuItemId: string): Observable<unknown> {
    const pending = this.pendingItems.get(menuItemId);

    if (pending) {
      return this.saveMenuItemService
        .addMenuItem(this.id(), menuItemId, pending)
        .pipe(
          tap(() => {
            this.pendingItems.delete(menuItemId);
            this.load(true);
          }),
        );
    }

    const item = this.editor
      .flatItems(this.detail())
      .find((candidate) => candidate.id === menuItemId);
    if (!item) return of(void 0);

    return this.saveMenuItemService
      .updateMenuItem(this.id(), menuItemId, {
        quantity: item.quantity,
        unit: item.unit,
      })
      .pipe(tap(() => this.load(true)));
  }

  private commitRemoveItem(menuItemId: string): void {
    this.pendingItems.delete(menuItemId);
    this.loadedDetail.update((detail) =>
      detail ? this.editor.withoutItemApplied(detail, menuItemId) : detail,
    );

    this.autosave.push(this.itemKey(menuItemId), () =>
      this.saveMenuItemService
        .removeMenuItem(this.id(), menuItemId)
        .pipe(tap(() => this.load(true))),
    );
  }

  private itemKey(menuItemId: string): string {
    return `item:${menuItemId}`;
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
