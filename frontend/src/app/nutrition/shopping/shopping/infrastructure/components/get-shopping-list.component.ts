import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { RouteStepComponent } from "@shared/design-system/route-step/infrastructure/components/route-step.component";
import { ProgressBarComponent } from "@shared/design-system/progress-bar/infrastructure/components/progress-bar.component";
import { BigFigureComponent } from "@shared/design-system/big-figure/infrastructure/components/big-figure.component";
import { ModuleCardComponent } from "@shared/design-system/module-card/infrastructure/components/module-card.component";
import { DOCUMENT } from "@angular/common";
import { Router } from "@angular/router";
import { QuickAddComponent } from "@shared/design-system/quick-add/infrastructure/components/quick-add.component";
import { CompletionCardComponent } from "@shared/design-system/completion-card/infrastructure/components/completion-card.component";
import { DisclosureComponent } from "@shared/design-system/disclosure/infrastructure/components/disclosure.component";
import { RouteIndexComponent } from "@shared/design-system/route-index/infrastructure/components/route-index.component";
import { StoreCellsComponent } from "@shared/design-system/store-cells/infrastructure/components/store-cells.component";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { forkJoin, of } from "rxjs";
import { tap } from "rxjs/operators";
import { AutosaveService } from "@shared/autosave/application/services/autosave.service";
import { UndoService } from "@shared/undo/application/services/undo.service";
import { SaveStatusComponent } from "@shared/design-system/save-status/infrastructure/components/save-status.component";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonSummaryComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-summary.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { ProductCardComponent } from "@shared/design-system/product-card/infrastructure/components/product-card.component";
import { ChoiceChipsComponent } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { DividerComponent } from "@shared/design-system/divider/infrastructure/components/divider.component";
import { ShoppingItemComponent } from "@shared/design-system/shopping-item/infrastructure/components/shopping-item.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { ViewSwitchComponent } from "@shared/design-system/view-switch/infrastructure/components/view-switch.component";
import { ViewSwitchOption } from "@shared/design-system/view-switch/domain/models/view-switch-option.model";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { Supermarket } from "@nutrition/catalog/supermarket/domain/models/supermarket.model";
import { GetSupermarketsService } from "@nutrition/catalog/supermarket/application/services/get-supermarkets.service";
import { ManageAislesComponent } from "@nutrition/catalog/supermarket/infrastructure/components/manage-aisles.component";
import { Article } from "@nutrition/catalog/article/domain/models/article.model";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
import { ShoppingListItemView } from "@nutrition/shopping/shopping/domain/models/shopping-list.model";
import { GetShoppingListService } from "@nutrition/shopping/shopping/application/services/get-shopping-list.service";
import { AddShoppingListItemService } from "@nutrition/shopping/shopping/application/services/add-shopping-list-item.service";
import { UpdateShoppingListItemService } from "@nutrition/shopping/shopping/application/services/update-shopping-list-item.service";
import { DeleteShoppingListItemService } from "@nutrition/shopping/shopping/application/services/delete-shopping-list-item.service";
import {
  ALL_FILTER,
  ALL_STORES,
  ShoppingItemRow,
  ShoppingPackLabels,
  ShoppingListViewService,
} from "@nutrition/shopping/shopping/application/services/shopping-list-view.service";
import { ShoppingGroupLabels } from "@nutrition/shopping/shopping/domain/models/shopping-group-labels.model";
import { ShoppingSortMode } from "@nutrition/shopping/shopping/domain/models/shopping-sort-mode.model";
import { ShoppingListAttributes } from "@nutrition/shopping/shopping/domain/models/shopping-list.model";
import { DiaryShoppingSheetComponent } from "./diary-shopping-sheet.component";
import { AggregateNavigationService } from "@shared/routing/application/services/aggregate-navigation.service";
import { AggregateKind } from "@shared/routing/domain/models/aggregate-kind.enum";

type FilterKind = "store" | "cat" | "brand";

@Component({
  selector: "app-get-shopping-list",
  templateUrl: "./get-shopping-list.component.html",
  styleUrls: ["./get-shopping-list.component.css"],
  imports: [
    RevealDirective,
    RouteStepComponent,
    ProgressBarComponent,
    BigFigureComponent,
    ModuleCardComponent,
    QuickAddComponent,
    CompletionCardComponent,
    DisclosureComponent,
    RouteIndexComponent,
    StoreCellsComponent,
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    StackComponent,
    TextComponent,
    TextInputComponent,
    HeadingComponent,
    ButtonComponent,
    SkeletonComponent,
    SkeletonSummaryComponent,
    SkeletonListComponent,
    EmptyStateComponent,
    ModalSheetComponent,
    SearchInputComponent,
    ProductCardComponent,
    ChoiceChipsComponent,
    DividerComponent,
    ShoppingItemComponent,
    ConfirmActionModalComponent,
    ViewSwitchComponent,
    ManageAislesComponent,
    DiaryShoppingSheetComponent,
    SaveStatusComponent,
  ],
})
export class GetShoppingListComponent implements OnInit {
  private document = inject(DOCUMENT);
  private router = inject(Router);
  quickQuery = signal("");
  cartOpen = signal(false);
  private translationService = inject(TranslationService);
  private aggregateNavigation = inject(AggregateNavigationService);
  protected autosave = inject(AutosaveService);
  protected undo = inject(UndoService);
  private getShoppingListService = inject(GetShoppingListService);
  private addShoppingListItemService = inject(AddShoppingListItemService);
  private updateShoppingListItemService = inject(UpdateShoppingListItemService);
  private deleteShoppingListItemService = inject(DeleteShoppingListItemService);
  private getArticlesService = inject(GetArticlesService);
  private getSupermarketsService = inject(GetSupermarketsService);
  protected view = inject(ShoppingListViewService);

  private readonly MODULE_PATH = "nutrition/shopping/shopping";

  readonly skeletonGroups = [3, 2];

  readonly customNameMaxLength = 120;

  loading = signal(true);
  loadedAttributes = signal<ShoppingListAttributes | null>(null);
  activeTab = signal<string>(ALL_STORES);
  listSearch = signal("");
  sortMode = signal<ShoppingSortMode>(ShoppingSortMode.Aisle);
  supermarkets = signal<Supermarket[]>([]);
  aisleSheetOpen = signal(false);
  diarySheetOpen = signal(false);

  clearModalOpen = signal(false);
  clearing = signal(false);

  sheetOpen = signal(false);
  customName = signal("");
  articles = signal<Article[]>([]);
  sheetSearch = signal("");
  storeFilter = signal(ALL_FILTER);
  categoryFilter = signal(ALL_FILTER);
  brandFilter = signal(ALL_FILTER);
  openFilter = signal<FilterKind | null>(null);

  attributes = computed<ShoppingListAttributes | null>(() => {
    const removedId = this.undo.removedId();
    const loadedAttributes = this.loadedAttributes();
    if (!removedId || !loadedAttributes) return loadedAttributes;

    return this.view.withoutItem(loadedAttributes, removedId);
  });

  effectiveTab = computed(() => {
    const attributes = this.attributes();
    if (!attributes) return ALL_STORES;

    return this.view.resolveTab(attributes, this.activeTab());
  });

  storeCells = computed(() => {
    const attributes = this.attributes();
    if (!attributes) return [];

    return this.view.storeCells(attributes, this.groupLabels());
  });

  showStoreCells = computed(() => {
    const attributes = this.attributes();
    return !!attributes && this.view.hasStoreCells(attributes);
  });

  visibleItems = computed(() => {
    const attributes = this.attributes();
    if (!attributes) return [];

    return this.view.visibleItems(attributes, this.effectiveTab());
  });

  searchedItems = computed(() =>
    this.view.searchedItems(this.visibleItems(), this.listSearch()),
  );

  packLabels = computed<ShoppingPackLabels>(() => ({
    perPack: this.t("getShopping.pack.perPack"),
    need: this.t("getShopping.pack.need"),
    leftover: this.t("getShopping.pack.leftover"),
  }));

  groupLabels = computed<ShoppingGroupLabels>(() => ({
    all: this.t("getShopping.tabs.all"),
    pending: this.t("getShopping.pending"),
    done: this.t("getShopping.done"),
    withoutStore: this.t("getShopping.withoutStore"),
    withoutAisle: this.t("getShopping.sort.withoutAisle"),
  }));

  sortOptions = computed<ViewSwitchOption[]>(() => [
    {
      value: ShoppingSortMode.Aisle,
      label: this.t("getShopping.sort.aisle"),
      icon: "aisles",
    },
    {
      value: ShoppingSortMode.Category,
      label: this.t("getShopping.sort.category"),
      icon: "tag",
    },
  ]);

  manageAislesLabel = computed(() => this.t("getShopping.sort.manage"));

  addLabel = computed(() => this.t("getShopping.add"));

  customPlaceholder = computed(() => this.t("getShopping.custom.placeholder"));

  customAddLabel = computed(() => this.t("getShopping.custom.add"));

  canAddCustom = computed(
    () => this.view.normalizeCustomName(this.customName()).length > 0,
  );

  generateFromDiaryLabel = computed(() => this.t("getShopping.diary.title"));

  activeSupermarketId = computed(() => {
    const tab = this.effectiveTab();
    if (ALL_STORES === tab) return null;

    return (
      this.supermarkets().find(
        (supermarket) => supermarket.attributes.name === tab,
      )?.id ?? null
    );
  });

  groups = computed(() =>
    this.view.routeGroups(
      this.visibleItems(),
      this.effectiveTab(),
      this.attributes()?.stores.length ?? 0,
      this.sortMode(),
      this.groupLabels(),
      this.packLabels(),
      this.listSearch(),
    ),
  );

  summary = computed(() => this.view.hero(this.attributes()?.items ?? []));

  cart = computed(() =>
    this.view.cartRows(
      this.searchedItems(),
      this.packLabels(),
      this.effectiveTab() === ALL_STORES,
    ),
  );
  scopeSummary = computed(() => this.view.hero(this.visibleItems()));
  cartSummary = computed(() => this.view.hero(this.searchedItems()));
  headerLabel = computed(() =>
    this.t("getShopping.header", {
      count: this.attributes()?.itemCount ?? 0,
      stores: this.attributes()?.stores.length ?? 0,
    }),
  );
  cartProgressLabel = computed(() =>
    this.t("getShopping.summary.cartProgress", {
      count: this.summary().count,
      done: this.summary().inCart,
    }),
  );
  totalSuffix = computed(() =>
    this.t("getShopping.summary.ofTotal", { total: this.summary().totalLabel }),
  );
  cartMeta = computed(
    () => `${this.cart().length} · ${this.cartSummary().cartLabel}`,
  );
  completionText = computed(() =>
    this.t("getShopping.completion.text", {
      total: this.scopeSummary().cartLabel,
    }),
  );
  isRouteMode = computed(() => this.sortMode() === ShoppingSortMode.Aisle);
  showRouteIndex = computed(
    () => this.isRouteMode() && !this.complete() && this.groups().length > 0,
  );
  routeTitle = computed(() =>
    this.effectiveTab() === ALL_STORES
      ? this.t("getShopping.route")
      : `${this.t("getShopping.route")} · ${this.effectiveTab()}`,
  );

  itemToggleLabel(item: ShoppingItemRow): string {
    return this.t(
      item.checked ? "getShopping.cart.remove" : "getShopping.cart.add",
      { name: item.name },
    );
  }

  routeIndex = computed(() => this.view.routeIndex(this.groups()));
  complete = computed(
    () =>
      this.visibleItems().length > 0 &&
      this.visibleItems().every((item) => item.checked),
  );
  quickSuggestions = computed(() =>
    this.view.quickSuggestions(
      this.articles(),
      this.listArticleIds(),
      this.quickQuery(),
      5,
    ),
  );

  scrollToGroup(id: string): void {
    const reducedMotion = this.document.defaultView?.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    this.document.getElementById(id)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  scanTicket(): void {
    void this.router.navigateByUrl("/tickets/scan");
  }

  quickAddCustom(name: string): void {
    this.customName.set(name);
    this.addCustomItem();
  }

  isEmpty = computed(() => (this.attributes()?.itemCount ?? 0) === 0);

  tabEmpty = computed(
    () => !this.isEmpty() && this.visibleItems().length === 0,
  );

  searchEmpty = computed(
    () => !this.tabEmpty() && this.searchedItems().length === 0,
  );

  hasChecked = computed(() => this.visibleItems().some((item) => item.checked));

  private listArticleIds = computed(
    () =>
      new Set(
        (this.attributes()?.items ?? [])
          .map((item) => item.articleId)
          .filter((articleId): articleId is string => null !== articleId),
      ),
  );

  facets = computed(() => this.view.facets(this.articles()));

  sheetProducts = computed(() =>
    this.view.sheetProducts(
      this.articles(),
      this.listArticleIds(),
      this.sheetSearch(),
      this.storeFilter(),
      this.categoryFilter(),
      this.brandFilter(),
    ),
  );

  filterOptions = computed(() => {
    const kind = this.openFilter();
    if (!kind) return [];

    const source =
      kind === "store"
        ? this.facets().stores
        : kind === "cat"
          ? this.facets().categories
          : this.facets().brands;

    return [
      { value: ALL_FILTER, label: this.t("getShopping.filters.all") },
      ...source.map((value) => ({ value, label: value })),
    ];
  });

  currentFilterValue = computed(() => {
    const kind = this.openFilter();
    if (kind === "store") return this.storeFilter();
    if (kind === "cat") return this.categoryFilter();
    if (kind === "brand") return this.brandFilter();

    return ALL_FILTER;
  });

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => this.load());

    this.loadArticles();
    this.loadSupermarkets();
  }

  onListSearch(query: string): void {
    this.listSearch.set(query);
  }

  onSort(mode: string): void {
    this.sortMode.set(mode as ShoppingSortMode);
  }

  openAisleSheet(): void {
    this.aisleSheetOpen.set(true);
  }

  closeAisleSheet(): void {
    this.aisleSheetOpen.set(false);
  }

  openDiarySheet(): void {
    this.diarySheetOpen.set(true);
  }

  closeDiarySheet(): void {
    this.diarySheetOpen.set(false);
  }

  onDiaryNeedsAdded(): void {
    this.load(true);
  }

  onAislesSaved(): void {
    this.loadSupermarkets();
    this.load(true);
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  filterChevron(kind: FilterKind): DsIconName {
    return this.openFilter() === kind ? "chevronUp" : "chevronDown";
  }

  filterLabel(kind: FilterKind): string {
    const value =
      kind === "store"
        ? this.storeFilter()
        : kind === "cat"
          ? this.categoryFilter()
          : this.brandFilter();

    if (value !== ALL_FILTER) return value;

    return this.t(`getShopping.filters.${kind}`);
  }

  onTab(key: string): void {
    this.activeTab.set(key);
  }

  openSheet(): void {
    this.customName.set("");
    this.sheetSearch.set("");
    this.storeFilter.set(ALL_FILTER);
    this.categoryFilter.set(ALL_FILTER);
    this.brandFilter.set(ALL_FILTER);
    this.openFilter.set(null);
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
  }

  onSheetSearch(query: string): void {
    this.sheetSearch.set(query);
  }

  toggleFilter(kind: FilterKind): void {
    this.openFilter.update((current) => (current === kind ? null : kind));
  }

  onPickFilter(value: string | number): void {
    const kind = this.openFilter();
    const next = `${value}`;
    if (kind === "store") this.storeFilter.set(next);
    if (kind === "cat") this.categoryFilter.set(next);
    if (kind === "brand") this.brandFilter.set(next);
  }

  addProduct(articleId: string): void {
    if (this.listArticleIds().has(articleId)) return;

    const article = this.articles().find((entry) => entry.id === articleId);
    if (!article) return;

    const optimistic = this.view.optimisticItem(
      article,
      `pending-${articleId}`,
    );
    this.loadedAttributes.update((current) =>
      current ? this.view.addItem(current, optimistic) : current,
    );

    this.addShoppingListItemService.addShoppingListItem(articleId).subscribe({
      next: () => this.load(true),
      error: () => this.load(true),
    });
  }

  onCustomName(value: string): void {
    this.customName.set(value);
  }

  addCustomItem(): void {
    const customName = this.view.normalizeCustomName(this.customName());
    if (!customName) return;

    this.customName.set("");
    this.applyOptimisticCustomItem(customName);

    this.addShoppingListItemService
      .addCustomShoppingListItem(customName)
      .subscribe({
        next: () => this.load(true),
        error: () => this.load(true),
      });
  }

  private applyOptimisticCustomItem(customName: string): void {
    this.loadedAttributes.update((current) => {
      if (!current) return current;

      const existing = this.view.findCustomItem(current, customName);
      if (existing) {
        return this.view.increaseItemQuantity(current, existing.id);
      }

      return this.view.addItem(
        current,
        this.view.optimisticCustomItem(customName, `pending-${customName}`),
      );
    });
  }

  onOpenItem(item: ShoppingItemRow): void {
    this.aggregateNavigation.open(AggregateKind.Product, item.articleId);
  }

  toggleChecked(item: ShoppingItemRow): void {
    this.patchItem(item.id, { checked: !item.checked });
    this.queueItem(item.id);
  }

  increment(item: ShoppingItemRow): void {
    this.patchItem(item.id, { quantity: item.quantity + 1 });
    this.queueItem(item.id);
  }

  decrement(item: ShoppingItemRow): void {
    if (item.quantity <= 1) return;

    this.patchItem(item.id, { quantity: item.quantity - 1 });
    this.queueItem(item.id);
  }

  removeItem(item: ShoppingItemRow): void {
    this.undo.schedule({
      id: item.id,
      keyTranslation: "getShopping.removed",
      details: { name: item.name },
      commit: () => this.commitRemoveItem(item.id),
    });
  }

  onRetrySave(): void {
    this.autosave.retry();
  }

  private queueItem(itemId: string): void {
    this.autosave.push(`item:${itemId}`, () => {
      const item = this.attributes()?.items.find(
        (candidate) => candidate.id === itemId,
      );
      if (!item) return of(void 0);

      return this.updateShoppingListItemService.updateShoppingListItem(
        itemId,
        item.quantity,
        item.checked,
      );
    });
  }

  private commitRemoveItem(itemId: string): void {
    this.loadedAttributes.update((current) =>
      current ? this.view.withoutItem(current, itemId) : current,
    );

    this.autosave.push(`item:${itemId}`, () =>
      this.deleteShoppingListItemService
        .deleteShoppingListItem(itemId)
        .pipe(tap(() => this.load(true))),
    );
  }

  askClearChecked(): void {
    if (!this.hasChecked()) return;

    this.clearModalOpen.set(true);
  }

  cancelClearChecked(): void {
    this.clearModalOpen.set(false);
  }

  confirmClearChecked(): void {
    const checked = this.visibleItems().filter((item) => item.checked);
    if (checked.length === 0) {
      this.clearModalOpen.set(false);
      return;
    }

    this.clearing.set(true);

    forkJoin(
      checked.map((item) =>
        this.deleteShoppingListItemService.deleteShoppingListItem(item.id),
      ),
    ).subscribe({
      next: () => {
        this.clearing.set(false);
        this.clearModalOpen.set(false);
        this.load(true);
      },
      error: () => this.clearing.set(false),
    });
  }

  private patchItem(
    itemId: string,
    changes: Partial<Pick<ShoppingListItemView, "quantity" | "checked">>,
  ): void {
    this.loadedAttributes.update((current) => {
      if (!current) return current;

      const items = current.items.map((item) => {
        if (item.id !== itemId) return item;

        const quantity = changes.quantity ?? item.quantity;
        const checked = changes.checked ?? item.checked;

        return {
          ...item,
          quantity,
          checked,
          lineTotal: Math.round((item.unitPrice ?? 0) * quantity * 100) / 100,
        };
      });

      return { ...current, items };
    });
  }

  private load(silent = false): void {
    if (!silent) this.loading.set(true);

    this.getShoppingListService.getShoppingList().subscribe({
      next: (response) => {
        this.loadedAttributes.set(response.data.attributes);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadArticles(): void {
    this.getArticlesService.getArticles(1, 300).subscribe({
      next: (response) => this.articles.set(response.data),
    });
  }

  private loadSupermarkets(): void {
    this.getSupermarketsService.getSupermarkets(1, 100).subscribe({
      next: (response) => this.supermarkets.set(response.data),
    });
  }
}
