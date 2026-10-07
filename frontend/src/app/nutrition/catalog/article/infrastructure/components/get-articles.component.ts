import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { switchMap } from "rxjs/operators";
import { Article } from "../../domain/models/article.model";
import {
  ArticleCardView,
  ArticleViewService,
} from "@nutrition/catalog/article/application/services/article-view.service";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
import { GetArticleFacetsService } from "@nutrition/catalog/article/application/services/get-article-facets.service";
import { ChangeArticleFavoriteService } from "@nutrition/catalog/article/application/services/change-article-favorite.service";
import { ArticleFavoriteFilter } from "@nutrition/catalog/article/domain/models/article-favorite-filter.enum";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonFiltersComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-filters.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SelectComponent } from "@shared/design-system/select/infrastructure/components/select.component";
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

@Component({
  selector: "app-get-articles",
  templateUrl: "./get-articles.component.html",
  imports: [
    RevealDirective,
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    ButtonComponent,
    SearchInputComponent,
    GridComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    SkeletonFiltersComponent,
    TextComponent,
    StackComponent,
    SelectComponent,
    ViewSwitchComponent,
    ProductCardComponent,
    InfiniteScrollComponent,
  ],
})
export class GetArticlesComponent extends AbstractListPageComponent<Article> {
  private getArticlesService = inject(GetArticlesService);
  private getArticleFacetsService = inject(GetArticleFacetsService);
  private changeArticleFavoriteService = inject(ChangeArticleFavoriteService);
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
  pendingFavorites = signal<ReadonlyMap<string, boolean>>(new Map());

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

  favoriteLabel = computed(() => this.t("getArticles.favorite.toggle"));

  private readonly refreshLoaded$ = new Subject<void>();

  reloading = signal(false);
  loadingMore = signal(false);

  categories = signal<string[]>([]);
  brands = signal<string[]>([]);
  stores = signal<string[]>([]);

  cards = computed<ArticleCardView[]>(() =>
    this.items().map((article) =>
      this.view.toCard(article, this.imageUrl(article)),
    ),
  );

  hasMore = computed(() => this.items().length < this.totalItems());

  headerSubtitle = computed(() => {
    const total = new Intl.NumberFormat("es-ES").format(this.totalItems());
    return `${total} ${this.t("getArticles.formats")}`;
  });

  constructor() {
    super();

    this.refreshLoaded$
      .pipe(
        switchMap(() => this.fetch(1, this.currentPage() * this.pageSize())),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.items.set(response.data.map((item) => this.withPending(item)));
        this.totalItems.set(response.meta.total);
      });
  }

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

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
    this.reload();
  }

  onBrandChange(value: string): void {
    this.selectedBrand.set(value);
    this.reload();
  }

  onStoreChange(value: string): void {
    this.selectedStore.set(value);
    this.reload();
  }

  onFavoriteFilterChange(value: string): void {
    this.favoriteFilter.set(value as ArticleFavoriteFilter);
    this.reload();
  }

  onToggleFavorite(id: string): void {
    if (this.pendingFavorites().has(id)) return;

    const article = this.items().find((item) => item.id === id);

    if (undefined === article) return;

    const favorite = !(article.attributes.favorite ?? false);

    this.setFavorite(id, favorite);
    this.pendingFavorites.update((pending) =>
      new Map(pending).set(id, favorite),
    );

    this.changeArticleFavoriteService
      .changeArticleFavorite(id, favorite)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.releaseFavorite(id);
          this.refreshLoaded$.next();
        },
        error: () => {
          this.setFavorite(id, !favorite);
          this.releaseFavorite(id);
        },
      });
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

  private favoriteParam(): boolean | undefined {
    if (ArticleFavoriteFilter.Only === this.favoriteFilter()) return true;

    return undefined;
  }

  private setFavorite(id: string, favorite: boolean): void {
    this.items.update((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, attributes: { ...item.attributes, favorite } }
          : item,
      ),
    );
  }

  private withPending(article: Article): Article {
    const favorite = this.pendingFavorites().get(article.id);

    if (undefined === favorite) return article;

    return { ...article, attributes: { ...article.attributes, favorite } };
  }

  private releaseFavorite(id: string): void {
    this.pendingFavorites.update((pending) => {
      const next = new Map(pending);
      next.delete(id);

      return next;
    });
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
}
