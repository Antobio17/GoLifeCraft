import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Observable } from "rxjs";
import { delay } from "rxjs/operators";
import { GlobalArticle } from "../../domain/models/global-article.model";
import { GlobalArticleSource } from "../../domain/models/global-article-source.model";
import {
  GlobalArticleCardView,
  GlobalArticleViewService,
} from "@nutrition/global-catalog/article/application/services/global-article-view.service";
import { GetGlobalArticlesService } from "@nutrition/global-catalog/article/application/services/get-global-articles.service";
import { ImportGlobalArticleService } from "@nutrition/global-catalog/article/application/services/import-global-article.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ProductCardComponent } from "@shared/design-system/product-card/infrastructure/components/product-card.component";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import { SelectComponent } from "@shared/design-system/select/infrastructure/components/select.component";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";

@Component({
  selector: "app-get-global-articles",
  templateUrl: "./get-global-articles.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    NoteComponent,
    SearchInputComponent,
    GridComponent,
    EmptyStateComponent,
    SkeletonComponent,
    TextComponent,
    ProductCardComponent,
    InfiniteScrollComponent,
    SelectComponent,
  ],
})
export class GetGlobalArticlesComponent extends AbstractListPageComponent<GlobalArticle> {
  private getGlobalArticlesService = inject(GetGlobalArticlesService);
  private importGlobalArticleService = inject(ImportGlobalArticleService);
  private floatingToastService = inject(FloatingToastService);
  private authSession = inject(AuthSessionService);
  protected view = inject(GlobalArticleViewService);
  canImport = this.authSession.isAuthenticated();

  protected readonly modulePath = "nutrition/global-catalog/article";
  protected readonly storageKey = "pageSize_globalArticles";

  searchQuery = signal("");
  sourceFilter = signal<string>(GlobalArticleSource.Mercadona);
  reloading = signal(false);
  loadingMore = signal(false);
  importedIds = signal<Set<string>>(new Set());
  pendingIds = signal<Set<string>>(new Set());

  cards = computed<GlobalArticleCardView[]>(() =>
    this.items().map((article) => this.view.toCard(article)),
  );

  hasMore = computed(() => this.items().length < this.totalItems());

  sourceOptions = computed<SelectOption[]>(() => [
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

  headerSubtitle = computed(() => {
    const total = new Intl.NumberFormat("es-ES").format(this.totalItems());
    return `${total} ${this.t("getGlobalArticles.pending")}`;
  });

  protected configureList(): void {
    this.currentPage.set(1);
    this.pageSize.set(20);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<GlobalArticle>> {
    return this.getGlobalArticlesService.getGlobalArticles(
      page,
      pageSize,
      this.searchQuery().trim() || undefined,
      this.sourceFilter() || undefined,
    );
  }

  loadMore(): void {
    if (this.loading() || this.loadingMore() || !this.hasMore()) return;

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

  isAdded(id: string): boolean {
    return this.importedIds().has(id);
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
    this.reloadFirstPage();
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

  back(): void {
    this.router.navigate(["/catalog"]);
  }

  onImport(id: string): void {
    if (!this.canImport || this.isAdded(id) || this.isPending(id)) return;

    this.markPending(id);

    this.importGlobalArticleService
      .importGlobalArticle(id)
      .pipe(delay(400))
      .subscribe({
        next: () => {
          this.markImported(id);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "getGlobalArticles.toast.imported",
            details: [],
          });
        },
        error: (error) => this.handleImportError(id, error),
      });
  }

  private handleImportError(id: string, error: { status?: number }): void {
    if (409 === error.status) {
      this.markImported(id);
      this.floatingToastService.showToast({
        status: 200,
        keyTranslation: "getGlobalArticles.toast.alreadyImported",
        details: [],
      });
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
