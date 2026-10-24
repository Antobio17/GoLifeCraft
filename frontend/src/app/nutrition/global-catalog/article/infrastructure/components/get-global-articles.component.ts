import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
import { Observable } from "rxjs";
import { GlobalArticle } from "../../domain/models/global-article.model";
import { GlobalArticleSource } from "../../domain/models/global-article-source.model";
import { GlobalArticleSort } from "../../domain/models/global-article-sort.enum";
import { GlobalArticleCardView } from "../../domain/models/global-article-card-view.model";
import { GlobalArticleCategoryCount } from "../../domain/models/global-article-category-count.model";
import { GlobalArticleActiveFilter } from "../../domain/models/global-article-active-filter.model";
import { GlobalArticleFilterKey } from "../../domain/models/global-article-filter-key.enum";
import { GlobalArticleViewService } from "@nutrition/global-catalog/article/application/services/global-article-view.service";
import { GetGlobalArticlesService } from "@nutrition/global-catalog/article/application/services/get-global-articles.service";
import { GetGlobalArticleFacetsService } from "@nutrition/global-catalog/article/application/services/get-global-article-facets.service";
import { ImportGlobalArticleService } from "@nutrition/global-catalog/article/application/services/import-global-article.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import {
  ChoiceChipOption,
  ChoiceChipsComponent,
} from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { ScrollRowComponent } from "@shared/design-system/scroll-row/infrastructure/components/scroll-row.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { PreferenceToggleComponent } from "@shared/design-system/preference-toggle/infrastructure/components/preference-toggle.component";
import { FilterPillComponent } from "@shared/design-system/filter-pill/infrastructure/components/filter-pill.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ProductCardComponent } from "@shared/design-system/product-card/infrastructure/components/product-card.component";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";

const ALL = "";
const TRUE = "1";

@Component({
  selector: "app-get-global-articles",
  templateUrl: "./get-global-articles.component.html",
  imports: [
    RevealDirective,
    FormsModule,
    NgTemplateOutlet,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    NoteComponent,
    SearchInputComponent,
    ButtonComponent,
    ChoiceChipsComponent,
    ScrollRowComponent,
    ModalSheetComponent,
    FieldComponent,
    PreferenceToggleComponent,
    FilterPillComponent,
    GridComponent,
    StackComponent,
    EmptyStateComponent,
    SkeletonComponent,
    SkeletonListComponent,
    TextComponent,
    ProductCardComponent,
    InfiniteScrollComponent,
  ],
})
export class GetGlobalArticlesComponent extends AbstractListPageComponent<GlobalArticle> {
  private getGlobalArticlesService = inject(GetGlobalArticlesService);
  private backNavigation = inject(BackNavigationService);
  private getGlobalArticleFacetsService = inject(GetGlobalArticleFacetsService);
  private importGlobalArticleService = inject(ImportGlobalArticleService);
  private floatingToastService = inject(FloatingToastService);
  private authSession = inject(AuthSessionService);
  protected view = inject(GlobalArticleViewService);
  canImport = this.authSession.isAuthenticated();

  protected readonly modulePath = "nutrition/global-catalog/article";
  protected readonly storageKey = "pageSize_globalArticles";
  protected override readonly appendsPages = true;

  readonly chipSkeletons = ["9rem", "6.5rem", "8rem"];

  searchQuery = signal("");
  sourceFilter = signal<string>(GlobalArticleSource.Mercadona);
  categoryFilter = signal(ALL);
  sortOrder = signal<string>(GlobalArticleSort.Name);
  withNutrition = signal(false);
  hideImported = signal(false);

  filtersOpen = signal(false);
  draftCategory = signal(ALL);
  draftSort = signal<string>(GlobalArticleSort.Name);
  draftWithNutrition = signal(false);
  draftHideImported = signal(false);

  categories = signal<GlobalArticleCategoryCount[]>([]);
  reloading = signal(false);
  loadingMore = signal(false);
  importedIds = signal<Set<string>>(new Set());
  pendingIds = signal<Set<string>>(new Set());

  cards = computed<GlobalArticleCardView[]>(() => {
    const importedIds = this.importedIds();

    return this.items().map((article) => {
      const card = this.view.toCard(article);

      return {
        ...card,
        imported: card.imported || importedIds.has(card.id),
        macroLabel: this.macroLabel(card),
      };
    });
  });

  hasMore = computed(() => this.items().length < this.totalItems());

  sourceOptions = computed<ChoiceChipOption[]>(() => [
    {
      value: GlobalArticleSource.Mercadona,
      label: this.view.sourceLabel(GlobalArticleSource.Mercadona) ?? "",
    },
    {
      value: GlobalArticleSource.OpenFoodFacts,
      label: this.view.sourceLabel(GlobalArticleSource.OpenFoodFacts) ?? "",
    },
    {
      value: GlobalArticleSource.All,
      label: this.t("getGlobalArticles.source.all"),
    },
  ]);

  categoryOptions = computed<ChoiceChipOption[]>(() => [
    { value: ALL, label: this.t("getGlobalArticles.category.all") },
    ...this.categories().map((category) => ({
      value: category.name,
      label: `${category.name} · ${this.view.count(category.count)}`,
    })),
  ]);

  sortOptions = computed<ChoiceChipOption[]>(() =>
    Object.values(GlobalArticleSort).map((sort) => ({
      value: sort,
      label: this.sortLabel(sort),
    })),
  );

  activeFilters = computed<GlobalArticleActiveFilter[]>(() => {
    const filters: GlobalArticleActiveFilter[] = [];

    if (ALL !== this.categoryFilter()) {
      filters.push({
        key: GlobalArticleFilterKey.Category,
        label: this.categoryFilter(),
      });
    }

    if (this.withNutrition()) {
      filters.push({
        key: GlobalArticleFilterKey.WithNutrition,
        label: this.t("getGlobalArticles.filter.withNutrition.pill"),
      });
    }

    if (this.hideImported()) {
      filters.push({
        key: GlobalArticleFilterKey.HideImported,
        label: this.t("getGlobalArticles.filter.hideImported.pill"),
      });
    }

    if (GlobalArticleSort.Name !== this.sortOrder()) {
      filters.push({
        key: GlobalArticleFilterKey.Sort,
        label: this.t("getGlobalArticles.filter.sortPill", {
          label: this.sortLabel(this.sortOrder()).toLowerCase(),
        }),
      });
    }

    return filters;
  });

  hasActiveFilters = computed(() => this.activeFilters().length > 0);

  filtersLabel = computed(() => {
    const active = this.activeFilters().length;
    const label = this.t("getGlobalArticles.filter.open");

    if (0 === active) return label;

    return `${label} (${active})`;
  });

  removeFilterLabel = computed(() => this.t("getGlobalArticles.filter.remove"));
  actionLabel = computed(() => this.t("getGlobalArticles.add"));
  addedLabel = computed(() => this.t("getGlobalArticles.added"));
  kcalUnit = computed(() => this.t("getGlobalArticles.macro.kcal"));
  macroLetters = computed(() => ({
    protein: this.t("getGlobalArticles.macro.proteinShort"),
    fat: this.t("getGlobalArticles.macro.fatShort"),
    carbs: this.t("getGlobalArticles.macro.carbsShort"),
  }));

  headerSubtitle = computed(() =>
    this.t("getGlobalArticles.subtitle", {
      count: this.totalItems(),
      total: this.view.count(this.totalItems()),
    }),
  );

  resultsLabel = computed(() =>
    this.t("getGlobalArticles.results", {
      count: this.totalItems(),
      total: this.view.count(this.totalItems()),
    }),
  );

  protected configureList(): void {
    this.currentPage.set(1);
    this.pageSize.set(20);
    this.loadCategories();
  }

  protected override captureFilters(): Record<string, string> {
    return {
      search: this.searchQuery(),
      source: this.sourceFilter(),
      category: this.categoryFilter(),
      sort: this.sortOrder(),
      withNutrition: this.withNutrition() ? TRUE : ALL,
      hideImported: this.hideImported() ? TRUE : ALL,
    };
  }

  protected override restoreFilters(filters: Record<string, string>): void {
    this.searchQuery.set(filters["search"] ?? "");
    this.sourceFilter.set(filters["source"] ?? GlobalArticleSource.Mercadona);
    this.categoryFilter.set(filters["category"] ?? ALL);
    this.sortOrder.set(filters["sort"] || GlobalArticleSort.Name);
    this.withNutrition.set(TRUE === filters["withNutrition"]);
    this.hideImported.set(TRUE === filters["hideImported"]);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<GlobalArticle>> {
    return this.getGlobalArticlesService.getGlobalArticles(page, pageSize, {
      name: this.searchQuery().trim() || undefined,
      source: this.sourceFilter() || undefined,
      category: this.categoryFilter() || undefined,
      withNutrition: this.withNutrition() || undefined,
      hideImported: this.hideImported() || undefined,
      orderBy: this.sortOrder(),
    });
  }

  loadMore(): void {
    if (
      this.loading() ||
      this.loadingMore() ||
      this.reloading() ||
      !this.hasMore()
    )
      return;

    const nextPage = this.currentPage() + 1;
    this.loadingMore.set(true);

    this.fetch(nextPage, this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.currentPage.set(nextPage);
          this.items.update((current) => [...current, ...response.data]);
          this.totalItems.set(response.meta.total);
          this.loadingMore.set(false);
        },
        error: () => this.loadingMore.set(false),
      });
  }

  isPending(id: string): boolean {
    return this.pendingIds().has(id);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.reloadFirstPage();
  }

  onSourceChange(source: string): void {
    if (source === this.sourceFilter()) return;

    this.sourceFilter.set(source);
    this.categoryFilter.set(ALL);
    this.loadCategories();
    this.reloadFirstPage();
  }

  openFilters(): void {
    this.draftCategory.set(this.categoryFilter());
    this.draftSort.set(this.sortOrder());
    this.draftWithNutrition.set(this.withNutrition());
    this.draftHideImported.set(this.hideImported());
    this.filtersOpen.set(true);
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  confirmFilters(): void {
    this.filtersOpen.set(false);

    if (
      this.draftCategory() === this.categoryFilter() &&
      this.draftSort() === this.sortOrder() &&
      this.draftWithNutrition() === this.withNutrition() &&
      this.draftHideImported() === this.hideImported()
    )
      return;

    this.categoryFilter.set(this.draftCategory());
    this.sortOrder.set(this.draftSort());
    this.withNutrition.set(this.draftWithNutrition());
    this.hideImported.set(this.draftHideImported());
    this.reloadFirstPage();
  }

  removeFilter(key: GlobalArticleFilterKey): void {
    if (GlobalArticleFilterKey.Category === key) this.categoryFilter.set(ALL);
    if (GlobalArticleFilterKey.WithNutrition === key)
      this.withNutrition.set(false);
    if (GlobalArticleFilterKey.HideImported === key)
      this.hideImported.set(false);
    if (GlobalArticleFilterKey.Sort === key)
      this.sortOrder.set(GlobalArticleSort.Name);

    this.reloadFirstPage();
  }

  resetFilters(): void {
    this.categoryFilter.set(ALL);
    this.sortOrder.set(GlobalArticleSort.Name);
    this.withNutrition.set(false);
    this.hideImported.set(false);
    this.reloadFirstPage();
  }

  back(): void {
    this.backNavigation.back(["/catalog"]);
  }

  openDetail(id: string): void {
    this.router.navigate(["/global-catalog", id]);
  }

  onImport(card: GlobalArticleCardView): void {
    if (!this.canImport || card.imported || this.isPending(card.id)) return;

    this.markPending(card.id);

    this.importGlobalArticleService.importGlobalArticle(card.id).subscribe({
      next: () => this.markImported(card.id),
      error: (error) => this.handleImportError(card.id, error),
    });
  }

  private macroLabel(card: GlobalArticleCardView): string {
    return [
      `${this.t("getGlobalArticles.macro.protein")} ${this.view.decimal(card.proteinG)} g`,
      `${this.t("getGlobalArticles.macro.fat")} ${this.view.decimal(card.fatG)} g`,
      `${this.t("getGlobalArticles.macro.carbs")} ${this.view.decimal(card.carbsG)} g`,
    ].join(", ");
  }

  private sortLabel(sort: string): string {
    if (GlobalArticleSort.Price === sort)
      return this.t("getGlobalArticles.sort.price");
    if (GlobalArticleSort.Protein === sort)
      return this.t("getGlobalArticles.sort.protein");
    if (GlobalArticleSort.Calories === sort)
      return this.t("getGlobalArticles.sort.calories");

    return this.t("getGlobalArticles.sort.name");
  }

  private loadCategories(): void {
    this.getGlobalArticleFacetsService
      .getGlobalArticleFacets(this.sourceFilter() || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((facets) => this.categories.set(facets.categoryCounts));
  }

  private reloadFirstPage(): void {
    this.currentPage.set(1);
    this.reloading.set(true);

    this.fetch(1, this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.items.set(response.data);
          this.totalItems.set(response.meta.total);
          this.reloading.set(false);
        },
        error: () => this.reloading.set(false),
      });
  }

  private handleImportError(id: string, error: { status?: number }): void {
    if (409 === error.status) {
      this.markImported(id);
      return;
    }

    this.clearPending(id);
    this.floatingToastService.showToast({
      status: 500,
      keyTranslation: "getGlobalArticles.toast.error",
      details: [],
    });
  }

  private markPending(id: string): void {
    this.pendingIds.update((set) => new Set(set).add(id));
  }

  private clearPending(id: string): void {
    this.pendingIds.update((set) => {
      const next = new Set(set);
      next.delete(id);
      return next;
    });
  }

  private markImported(id: string): void {
    this.importedIds.update((set) => new Set(set).add(id));
    this.clearPending(id);
  }
}
