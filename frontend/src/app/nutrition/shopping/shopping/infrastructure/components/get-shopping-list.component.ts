import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { forkJoin } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { ProductCardComponent } from "@shared/design-system/product-card/infrastructure/components/product-card.component";
import { ChoiceChipsComponent } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { DividerComponent } from "@shared/design-system/divider/infrastructure/components/divider.component";
import { StoreTabsComponent } from "@shared/design-system/store-tabs/infrastructure/components/store-tabs.component";
import { ShoppingSummaryComponent } from "@shared/design-system/shopping-summary/infrastructure/components/shopping-summary.component";
import { ShoppingItemComponent } from "@shared/design-system/shopping-item/infrastructure/components/shopping-item.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
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
  ShoppingListViewService,
} from "@nutrition/shopping/shopping/application/services/shopping-list-view.service";
import { ShoppingListAttributes } from "@nutrition/shopping/shopping/domain/models/shopping-list.model";

type FilterKind = "store" | "cat" | "brand";

@Component({
  selector: "app-get-shopping-list",
  templateUrl: "./get-shopping-list.component.html",
  styleUrls: ["./get-shopping-list.component.css"],
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    StackComponent,
    TextComponent,
    HeadingComponent,
    ButtonComponent,
    SkeletonComponent,
    EmptyStateComponent,
    ModalSheetComponent,
    SearchInputComponent,
    ProductCardComponent,
    ChoiceChipsComponent,
    DividerComponent,
    StoreTabsComponent,
    ShoppingSummaryComponent,
    ShoppingItemComponent,
    ConfirmActionModalComponent,
  ],
})
export class GetShoppingListComponent implements OnInit {
  private translationService = inject(TranslationService);
  private floatingToastService = inject(FloatingToastService);
  private authSession = inject(AuthSessionService);
  private getShoppingListService = inject(GetShoppingListService);
  private addShoppingListItemService = inject(AddShoppingListItemService);
  private updateShoppingListItemService = inject(UpdateShoppingListItemService);
  private deleteShoppingListItemService = inject(DeleteShoppingListItemService);
  private getArticlesService = inject(GetArticlesService);
  protected view = inject(ShoppingListViewService);

  private readonly MODULE_PATH = "nutrition/shopping/shopping";

  canWrite = this.authSession.isGod();

  loading = signal(true);
  attributes = signal<ShoppingListAttributes | null>(null);
  activeTab = signal<string>(ALL_STORES);

  clearModalOpen = signal(false);
  clearing = signal(false);

  sheetOpen = signal(false);
  articles = signal<Article[]>([]);
  sheetSearch = signal("");
  storeFilter = signal(ALL_FILTER);
  categoryFilter = signal(ALL_FILTER);
  brandFilter = signal(ALL_FILTER);
  openFilter = signal<FilterKind | null>(null);

  effectiveTab = computed(() => {
    const attributes = this.attributes();
    if (!attributes) return ALL_STORES;

    return this.view.resolveTab(attributes, this.activeTab());
  });

  storeTabs = computed(() => {
    const attributes = this.attributes();
    if (!attributes) return [];

    return this.view.storeTabs(attributes, this.t("getShopping.tabs.all"));
  });

  showTabs = computed(() => {
    const attributes = this.attributes();
    return !!attributes && this.view.hasStoreTabs(attributes);
  });

  visibleItems = computed(() => {
    const attributes = this.attributes();
    if (!attributes) return [];

    return this.view.visibleItems(attributes, this.effectiveTab());
  });

  groups = computed(() =>
    this.view.groups(this.visibleItems(), this.t("getShopping.items")),
  );

  summary = computed(() =>
    this.view.summary(this.visibleItems(), this.t("getShopping.bought")),
  );

  isEmpty = computed(() => (this.attributes()?.itemCount ?? 0) === 0);

  tabEmpty = computed(
    () => !this.isEmpty() && this.visibleItems().length === 0,
  );

  hasChecked = computed(() => this.visibleItems().some((item) => item.checked));

  private listArticleIds = computed(
    () =>
      new Set((this.attributes()?.items ?? []).map((item) => item.articleId)),
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
  }

  t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
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

    const optimistic = this.view.optimisticItem(article, `pending-${articleId}`);
    this.attributes.update((current) =>
      current ? this.view.addItem(current, optimistic) : current,
    );

    this.addShoppingListItemService.addShoppingListItem(articleId).subscribe({
      next: () => this.load(true),
      error: () => this.load(true),
    });
  }

  toggleChecked(item: ShoppingListItemView): void {
    const checked = !item.checked;
    this.patchItem(item.id, { checked });

    this.updateShoppingListItemService
      .updateShoppingListItem(item.id, item.quantity, checked)
      .subscribe();
  }

  increment(item: ShoppingListItemView): void {
    const quantity = item.quantity + 1;
    this.patchItem(item.id, { quantity });

    this.updateShoppingListItemService
      .updateShoppingListItem(item.id, quantity, item.checked)
      .subscribe();
  }

  decrement(item: ShoppingListItemView): void {
    if (item.quantity <= 1) return;

    const quantity = item.quantity - 1;
    this.patchItem(item.id, { quantity });

    this.updateShoppingListItemService
      .updateShoppingListItem(item.id, quantity, item.checked)
      .subscribe();
  }

  removeItem(item: ShoppingListItemView): void {
    this.deleteShoppingListItemService
      .deleteShoppingListItem(item.id)
      .subscribe({
        next: () => {
          this.toast("getShopping.toast.removed");
          this.load(true);
        },
      });
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
        this.toast("getShopping.toast.cleared");
        this.load(true);
      },
      error: () => this.clearing.set(false),
    });
  }

  private patchItem(
    itemId: string,
    changes: Partial<Pick<ShoppingListItemView, "quantity" | "checked">>,
  ): void {
    this.attributes.update((current) => {
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
        this.attributes.set(response.data.attributes);
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

  private toast(keyTranslation: string): void {
    this.floatingToastService.showToast({
      status: 200,
      keyTranslation,
      details: [],
    });
  }
}
