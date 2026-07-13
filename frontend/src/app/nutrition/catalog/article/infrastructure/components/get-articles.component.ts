import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Observable } from "rxjs";
import { Article } from "../../domain/models/article.model";
import {
  ArticleCardView,
  ArticleViewService,
} from "@nutrition/catalog/article/application/services/article-view.service";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
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
  ],
})
export class GetArticlesComponent extends AbstractListPageComponent<Article> {
  private getArticlesService = inject(GetArticlesService);
  private authSession = inject(AuthSessionService);
  protected view = inject(ArticleViewService);

  canWrite = this.authSession.isGod();

  protected readonly modulePath = "nutrition/catalog/article";
  protected readonly storageKey = "pageSize_articles";

  searchQuery = signal("");
  selectedCategory = signal(ALL);
  selectedBrand = signal(ALL);
  selectedStore = signal(ALL);

  categories = computed(() => this.options((a) => this.view.category(a)));
  brands = computed(() => this.options((a) => this.view.brand(a)));
  stores = computed(() => this.options((a) => this.view.store(a)));

  filteredArticles = computed<Article[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();
    const brand = this.selectedBrand();
    const store = this.selectedStore();

    return this.items().filter((article) => {
      const matchesQuery =
        !query ||
        article.attributes.name.toLowerCase().includes(query) ||
        (this.view.brand(article) ?? "").toLowerCase().includes(query);
      const matchesCategory =
        !category || this.view.category(article) === category;
      const matchesBrand = !brand || this.view.brand(article) === brand;
      const matchesStore = !store || this.view.store(article) === store;

      return matchesQuery && matchesCategory && matchesBrand && matchesStore;
    });
  });

  cards = computed<ArticleCardView[]>(() =>
    this.filteredArticles().map((article) => this.view.toCard(article)),
  );

  headerSubtitle = computed(() => {
    const label = this.t("getArticles.formats").toLowerCase();
    return `${this.filteredArticles().length} ${label}`;
  });

  hasResults = computed(() => this.filteredArticles().length > 0);

  protected configureList(): void {
    this.pageSize.set(100);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Article>> {
    return this.getArticlesService.getArticles(page, pageSize);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onSelect(id: string): void {
    this.router.navigate(["/catalog", id]);
  }

  onCreate(): void {
    this.router.navigate(["/catalog", "create"]);
  }

  private options(pick: (article: Article) => string | null): string[] {
    const values = this.items()
      .map(pick)
      .filter((value): value is string => null !== value && "" !== value);

    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }
}
