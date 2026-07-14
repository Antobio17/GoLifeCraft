import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Observable } from "rxjs";
import { RecipeListItem } from "../../domain/models/recipe.model";
import {
  RecipeCardView,
  RecipeViewService,
} from "@nutrition/recipe/recipe/application/services/recipe-view.service";
import { GetRecipesService } from "@nutrition/recipe/recipe/application/services/get-recipes.service";
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
import { RecipeCardComponent } from "@shared/design-system/recipe-card/infrastructure/components/recipe-card.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";

@Component({
  selector: "app-get-recipes",
  templateUrl: "./get-recipes.component.html",
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
    RecipeCardComponent,
  ],
})
export class GetRecipesComponent extends AbstractListPageComponent<RecipeListItem> {
  private getRecipesService = inject(GetRecipesService);
  private authSession = inject(AuthSessionService);
  protected view = inject(RecipeViewService);

  canWrite = this.authSession.isGod();

  protected readonly modulePath = "nutrition/recipe/recipe";
  protected readonly storageKey = "pageSize_recipes";

  searchQuery = signal("");

  filteredRecipes = computed<RecipeListItem[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.items().filter((recipe) => {
      if (!query) return true;

      return (
        recipe.attributes.name.toLowerCase().includes(query) ||
        recipe.attributes.category.toLowerCase().includes(query)
      );
    });
  });

  cards = computed<RecipeCardView[]>(() =>
    this.filteredRecipes().map((recipe) => this.view.toCard(recipe)),
  );

  headerSubtitle = computed(() => {
    const label = this.t("getRecipes.subtitle");
    return `${this.items().length} ${label}`;
  });

  hasResults = computed(() => this.filteredRecipes().length > 0);

  protected configureList(): void {
    this.pageSize.set(100);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<RecipeListItem>> {
    return this.getRecipesService.getRecipes(page, pageSize);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onSelect(id: string): void {
    this.router.navigate(["/recipes", id]);
  }

  onCreate(): void {
    this.router.navigate(["/recipes", "create"]);
  }
}
