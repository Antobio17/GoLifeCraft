import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
import { Observable } from "rxjs";
import { Article } from "../../domain/models/article.model";
import { ArticleViewService } from "@nutrition/catalog/article/application/services/article-view.service";
import { ArticleListRow } from "@nutrition/catalog/article/domain/models/article-list-row.model";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
import { GetArticleFacetsService } from "@nutrition/catalog/article/application/services/get-article-facets.service";
import { ArticleCreateAction } from "@nutrition/catalog/article/domain/models/article-create-action.enum";
import { ArticleFavoriteFilter } from "@nutrition/catalog/article/domain/models/article-favorite-filter.enum";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import {
  MenuComponent,
  MenuItem,
} from "@shared/design-system/menu/infrastructure/components/menu.component";
import {
  ChoiceChipOption,
  ChoiceChipsComponent,
} from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { ScrollRowComponent } from "@shared/design-system/scroll-row/infrastructure/components/scroll-row.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { ViewSwitchComponent } from "@shared/design-system/view-switch/infrastructure/components/view-switch.component";
import { ViewSwitchOption } from "@shared/design-system/view-switch/domain/models/view-switch-option.model";
import { ProductCardComponent } from "@shared/design-system/product-card/infrastructure/components/product-card.component";
import { AggregateImageService } from "@shared/aggregate-image/application/services/aggregate-image.service";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";

const ALL = "";

import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";
@Component({
  selector: "app-get-articles",
  templateUrl: "./get-articles.component.html",
  imports: [
    RevealDirective,
    FormsModule,
    NgTemplateOutlet,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    ButtonComponent,
    MenuComponent,
    ChoiceChipsComponent,
    ScrollRowComponent,
    ModalSheetComponent,
    FieldComponent,
    SkeletonComponent,
    SearchInputComponent,
    GridComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    TextComponent,
    StackComponent,
    ViewSwitchComponent,
    ProductCardComponent,
    InfiniteScrollComponent,
  ],
})
export class GetArticlesComponent extends AbstractListPageComponent<Article> {
  private backNavigation = inject(BackNavigationService);
  private getArticlesService = inject(GetArticlesService);
  private getArticleFacetsService = inject(GetArticleFacetsService);
  private authSession = inject(AuthSessionService);
  protected view = inject(ArticleViewService);
  private aggregateImageService = inject(AggregateImageService);
  private entityVisual = inject(EntityVisualService);

  canCreate = this.authSession.isAuthenticated();

  protected readonly modulePath = "nutrition/catalog/article";
  protected readonly storageKey = "pageSize_articles";
  protected override readonly appendsPages = true;

  searchQuery = signal("");
  selectedCategory = signal(ALL);
  selectedBrand = signal(ALL);
  selectedStore = signal(ALL);
  favoriteFilter = signal<ArticleFavoriteFilter>(ArticleFavoriteFilter.All);

  favoriteOptions = computed<ViewSwitchOption[]>(() => [
    {
      value: ArticleFavoriteFilter.All,
      label: this.t("getArticles.filter.favorite.all"),
      icon: "viewList",
    },
    {
      value: ArticleFavoriteFilter.Only,
      label: this.t("getArticles.filter.favorite.only"),
      icon: "star",
    },
  ]);

  favoriteLabel = computed(() => this.t("getArticles.favorite.mark"));
  macroLetters = computed(() => ({
    protein: this.t("getArticles.macro.proteinShort"),
    fat: this.t("getArticles.macro.fatShort"),
    carbs: this.t("getArticles.macro.carbsShort"),
  }));

  kcalUnit = computed(() => this.t("getArticles.macro.kcal"));

  createItems = computed<MenuItem[]>(() => [
    {
      value: ArticleCreateAction.Create,
      label: this.t("getArticles.createMenu.create"),
      icon: "plus",
    },
    {
      value: ArticleCreateAction.Scan,
      label: this.t("getArticles.createMenu.scan"),
      icon: "camera",
    },
    {
      value: ArticleCreateAction.Global,
      label: this.t("getArticles.createMenu.global"),
      icon: "globe",
    },
  ]);

  readonly chipSkeletons = ["4rem", "6.5rem", "4.5rem", "5rem"];

  filtersOpen = signal(false);
  draftCategory = signal(ALL);
  draftBrand = signal(ALL);

  reloading = signal(false);
  loadingMore = signal(false);

  categories = signal<string[]>([]);
  brands = signal<string[]>([]);
  stores = signal<string[]>([]);

  rows = computed<ArticleListRow[]>(() =>
    this.items().map((article) => {
      const row = this.view.toListRow(article, this.imageUrl(article));

      return { ...row, macroLabel: this.macroLabel(row) };
    }),
  );

  storeOptions = computed<ChoiceChipOption[]>(() =>
    this.withAll(this.stores(), this.t("getArticles.filter.allStores")),
  );

  categoryOptions = computed<ChoiceChipOption[]>(() =>
    this.withAll(this.categories(), this.t("getArticles.filter.allCategories")),
  );

  brandOptions = computed<ChoiceChipOption[]>(() =>
    this.withAll(this.brands(), this.t("getArticles.filter.allBrands")),
  );

  hasSheetFilters = computed(
    () => ALL !== this.selectedCategory() || ALL !== this.selectedBrand(),
  );

  filtersLabel = computed(() => {
    const active = [this.selectedCategory(), this.selectedBrand()].filter(
      (value) => ALL !== value,
    ).length;
    const label = this.t("getArticles.filter.open");

    if (0 === active) return label;

    return `${label} (${active})`;
  });

  hasMore = computed(() => this.items().length < this.totalItems());

  headerSubtitle = computed(() => {
    const total = new Intl.NumberFormat("es-ES").format(this.totalItems());
    return `${total} ${this.t("getArticles.formats")}`;
  });

  protected configureList(): void {
    this.currentPage.set(1);
    this.pageSize.set(20);
    this.loadFacets();
  }

  protected override captureFilters(): Record<string, string> {
    return {
      search: this.searchQuery(),
      category: this.selectedCategory(),
      brand: this.selectedBrand(),
      store: this.selectedStore(),
      favorite: this.favoriteFilter(),
    };
  }

  protected override restoreFilters(filters: Record<string, string>): void {
    this.searchQuery.set(filters["search"] ?? "");
    this.selectedCategory.set(filters["category"] ?? ALL);
    this.selectedBrand.set(filters["brand"] ?? ALL);
    this.selectedStore.set(filters["store"] ?? ALL);
    this.favoriteFilter.set(
      ArticleFavoriteFilter.Only === filters["favorite"]
        ? ArticleFavoriteFilter.Only
        : ArticleFavoriteFilter.All,
    );
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Article>> {
    return this.getArticlesService.getArticles(page, pageSize, {
      name: this.searchQuery().trim() || undefined,
      category: this.selectedCategory() || undefined,
      brand: this.selectedBrand() || undefined,
      store: this.selectedStore() || undefined,
      favorite: this.favoriteParam(),
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

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.reload();
  }

  onStoreChange(value: string): void {
    this.selectedStore.set(value);
    this.reload();
  }

  openFilters(): void {
    this.draftCategory.set(this.selectedCategory());
    this.draftBrand.set(this.selectedBrand());
    this.filtersOpen.set(true);
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  confirmFilters(): void {
    this.filtersOpen.set(false);

    if (
      this.draftCategory() === this.selectedCategory() &&
      this.draftBrand() === this.selectedBrand()
    )
      return;

    this.selectedCategory.set(this.draftCategory());
    this.selectedBrand.set(this.draftBrand());
    this.reload();
  }

  onCreateAction(action: string): void {
    if (ArticleCreateAction.Scan === action) {
      this.onScan();
      return;
    }

    if (ArticleCreateAction.Global === action) {
      this.onImportCatalog();
      return;
    }

    this.onCreate();
  }

  onFavoriteFilterChange(value: string): void {
    this.favoriteFilter.set(value as ArticleFavoriteFilter);
    this.reload();
  }

  onSelect(id: string): void {
    this.router.navigate(["/catalog", id]);
  }

  onScan(): void {
    this.router.navigate(["/catalog/scan"]);
  }

  onCreate(): void {
    this.router.navigate(["/catalog", "create"]);
  }

  onImportCatalog(): void {
    this.router.navigate(["/global-catalog"]);
  }

  private reload(): void {
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

  private macroLabel(row: ArticleListRow): string {
    return [
      `${this.t("getArticles.macro.protein")} ${this.view.decimal(row.proteinG)} g`,
      `${this.t("getArticles.macro.fat")} ${this.view.decimal(row.fatG)} g`,
      `${this.t("getArticles.macro.carbs")} ${this.view.decimal(row.carbsG)} g`,
    ].join(", ");
  }

  private withAll(values: string[], allLabel: string): ChoiceChipOption[] {
    return [
      { value: ALL, label: allLabel },
      ...values.map((value) => ({ value, label: value })),
    ];
  }

  private favoriteParam(): boolean | undefined {
    if (ArticleFavoriteFilter.Only === this.favoriteFilter()) return true;

    return undefined;
  }

  private loadFacets(): void {
    this.getArticleFacetsService
      .getArticleFacets()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((facets) => {
        this.categories.set(facets.categories);
        this.brands.set(facets.brands);
        this.stores.set(facets.stores);
      });
  }

  private imageUrl(article: Article): string | null {
    return this.entityVisual.urlOf(
      VisualSurface.Catalog,
      AggregateImageKind.Article,
      article.id,
      article.attributes.image ?? null,
    );
  }

  goBack(): void {
    this.backNavigation.back(["/kitchen"]);
  }
}
