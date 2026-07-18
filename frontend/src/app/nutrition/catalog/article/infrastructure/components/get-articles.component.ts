import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Observable } from "rxjs";
import { Article } from "../../domain/models/article.model";
import {
  ArticleCardView,
  ArticleViewService,
} from "@nutrition/catalog/article/application/services/article-view.service";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
import { GetArticleFacetsService } from "@nutrition/catalog/article/application/services/get-article-facets.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SelectComponent } from "@shared/design-system/select/infrastructure/components/select.component";
import { ProductCardComponent } from "@shared/design-system/product-card/infrastructure/components/product-card.component";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";

const ALL = "";

@Component({
  selector: "app-get-articles",
  templateUrl: "./get-articles.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    ButtonComponent,
    SearchInputComponent,
    GridComponent,
    EmptyStateComponent,
    SkeletonComponent,
    TextComponent,
    StackComponent,
    SelectComponent,
    ProductCardComponent,
    InfiniteScrollComponent,
  ],
})
export class GetArticlesComponent extends AbstractListPageComponent<Article> {
  private getArticlesService = inject(GetArticlesService);
  private getArticleFacetsService = inject(GetArticleFacetsService);
  private authSession = inject(AuthSessionService);
  protected view = inject(ArticleViewService);

  canCreate = this.authSession.isAuthenticated();

  protected readonly modulePath = "nutrition/catalog/article";
  protected readonly storageKey = "pageSize_articles";

  searchQuery = signal("");
  selectedCategory = signal(ALL);
  selectedBrand = signal(ALL);
  selectedStore = signal(ALL);

  reloading = signal(false);
  loadingMore = signal(false);

  categories = signal<string[]>([]);
  brands = signal<string[]>([]);
  stores = signal<string[]>([]);

  cards = computed<ArticleCardView[]>(() =>
    this.items().map((article) => this.view.toCard(article)),
  );

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

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Article>> {
    return this.getArticlesService.getArticles(page, pageSize, {
      name: this.searchQuery().trim() || undefined,
      category: this.selectedCategory() || undefined,
      brand: this.selectedBrand() || undefined,
      store: this.selectedStore() || undefined,
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

  onSelect(id: string): void {
    this.router.navigate(["/catalog", id]);
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
}
