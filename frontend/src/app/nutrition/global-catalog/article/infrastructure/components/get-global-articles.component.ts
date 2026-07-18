import { Component, computed, inject, signal } from "@angular/core";
import { Observable, forkJoin, of } from "rxjs";
import { catchError, delay } from "rxjs/operators";
import { GlobalArticle } from "../../domain/models/global-article.model";
import {
  GlobalArticleCardView,
  GlobalArticleViewService,
} from "@nutrition/global-catalog/article/application/services/global-article-view.service";
import { GetGlobalArticlesService } from "@nutrition/global-catalog/article/application/services/get-global-articles.service";
import { ImportGlobalArticleService } from "@nutrition/global-catalog/article/application/services/import-global-article.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ProductCardComponent } from "@shared/design-system/product-card/infrastructure/components/product-card.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";

@Component({
  selector: "app-get-global-articles",
  templateUrl: "./get-global-articles.component.html",
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    ButtonComponent,
    NoteComponent,
    SearchInputComponent,
    GridComponent,
    EmptyStateComponent,
    SkeletonComponent,
    TextComponent,
    ProductCardComponent,
  ],
})
export class GetGlobalArticlesComponent extends AbstractListPageComponent<GlobalArticle> {
  private getGlobalArticlesService = inject(GetGlobalArticlesService);
  private importGlobalArticleService = inject(ImportGlobalArticleService);
  private floatingToastService = inject(FloatingToastService);
  protected view = inject(GlobalArticleViewService);

  protected readonly modulePath = "nutrition/global-catalog/article";
  protected readonly storageKey = "pageSize_globalArticles";

  searchQuery = signal("");
  importedIds = signal<Set<string>>(new Set());
  pendingIds = signal<Set<string>>(new Set());

  filteredArticles = computed<GlobalArticle[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.items().filter(
      (article) => !query || this.view.matchesQuery(article, query),
    );
  });

  cards = computed<GlobalArticleCardView[]>(() =>
    this.filteredArticles().map((article) => this.view.toCard(article)),
  );

  pendingCount = computed(
    () =>
      this.filteredArticles().filter(
        (article) => !this.importedIds().has(article.id),
      ).length,
  );

  headerSubtitle = computed(() => {
    const label = this.t("getGlobalArticles.pending").toLowerCase();
    return `${this.pendingCount()} ${label}`;
  });

  importAllLabel = computed(() =>
    this.pendingCount() > 0
      ? `${this.t("getGlobalArticles.importAll")} (${this.pendingCount()})`
      : this.t("getGlobalArticles.allImported"),
  );

  hasResults = computed(() => this.filteredArticles().length > 0);

  protected configureList(): void {
    this.pageSize.set(100);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<GlobalArticle>> {
    return this.getGlobalArticlesService.getGlobalArticles(page, pageSize);
  }

  isAdded(id: string): boolean {
    return this.importedIds().has(id);
  }

  isPending(id: string): boolean {
    return this.pendingIds().has(id);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  back(): void {
    this.router.navigate(["/catalog"]);
  }

  onImport(id: string): void {
    if (this.isAdded(id) || this.isPending(id)) return;

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

  importAll(): void {
    const ids = this.filteredArticles()
      .map((article) => article.id)
      .filter((id) => !this.isAdded(id) && !this.isPending(id));

    if (0 === ids.length) return;

    ids.forEach((id) => this.markPending(id));

    forkJoin(
      ids.map((id) =>
        this.importGlobalArticleService
          .importGlobalArticle(id)
          .pipe(catchError(() => of(null))),
      ),
    ).subscribe(() => {
      ids.forEach((id) => this.markImported(id));
      this.floatingToastService.showToast({
        status: 200,
        keyTranslation: "getGlobalArticles.toast.importedAll",
        details: [],
      });
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
