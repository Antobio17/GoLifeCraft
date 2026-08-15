import { Component, computed, inject, input, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ProductHeroComponent } from "@shared/design-system/product-hero/infrastructure/components/product-hero.component";
import { MacroBarsComponent } from "@shared/design-system/macro-bars/infrastructure/components/macro-bars.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { SkeletonChipsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-chips.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonHeroComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-hero.component";
import { SkeletonMacroBarsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-macro-bars.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { GetRecipeService } from "@nutrition/recipe/recipe/application/services/get-recipe.service";
import { DeleteRecipeService } from "@nutrition/recipe/recipe/application/services/delete-recipe.service";
import {
  MacroShortLabels,
  RecipeViewService,
} from "@nutrition/recipe/recipe/application/services/recipe-view.service";
import {
  RecipeDetail,
  RecipeIngredientView,
} from "@nutrition/recipe/recipe/domain/models/recipe.model";
import { MacroBadgesComponent } from "@shared/design-system/macro-badges/infrastructure/components/macro-badges.component";
import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";

@Component({
  selector: "app-get-recipe",
  templateUrl: "./get-recipe.component.html",
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    ProductHeroComponent,
    MacroBarsComponent,
    MacroBadgesComponent,
    SectionHeaderComponent,
    CardComponent,
    StackComponent,
    ChipComponent,
    TextComponent,
    ButtonComponent,
    EmojiTileComponent,
    NoteComponent,
    SkeletonChipsComponent,
    SkeletonScreenHeaderComponent,
    SkeletonHeroComponent,
    SkeletonMacroBarsComponent,
    SkeletonSectionHeaderComponent,
    SkeletonListComponent,
    EmptyStateComponent,
    ConfirmActionModalComponent,
  ],
})
export class GetRecipeComponent {
  private translationService = inject(TranslationService);
  private getRecipeService = inject(GetRecipeService);
  private deleteRecipeService = inject(DeleteRecipeService);
  private authSession = inject(AuthSessionService);
  protected view = inject(RecipeViewService);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/recipe/recipe";

  canWrite = computed(() => this.authSession.isGod());

  loading = signal(true);
  recipe = signal<RecipeDetail | null>(null);
  showDeleteModal = signal(false);
  deleting = signal(false);

  readonly id = input.required<string>();

  attributes = computed(() => this.recipe()?.attributes ?? null);

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);

    toObservable(this.id)
      .pipe(
        switchMap((id) => {
          this.loading.set(true);
          return this.getRecipeService
            .getRecipe(id)
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        this.recipe.set(response?.data ?? null);
        this.loading.set(false);
      });
  }

  t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  macroLabels = computed<MacroShortLabels>(() => ({
    protein: this.t("getRecipe.macro.proteinShort"),
    fat: this.t("getRecipe.macro.fatShort"),
    carbs: this.t("getRecipe.macro.carbsShort"),
  }));

  ingredientRows = computed(() =>
    (this.attributes()?.ingredients ?? []).map((ingredient) => ({
      ingredient,
      quantityLabel: this.view.ingredientQuantityLabel(ingredient),
      kcal: this.ingredientKcal(ingredient),
      macros: this.ingredientMacros(ingredient),
    })),
  );

  ingredientKcal(ingredient: RecipeIngredientView): string {
    return `${this.view.integer(ingredient.macros.calories)} ${this.t("getRecipe.macro.kcal")}`;
  }

  ingredientMacros(ingredient: RecipeIngredientView): MacroBadge[] {
    return this.view.macroItems(ingredient.macros, this.macroLabels());
  }

  totalLabel(calories: number): string {
    return `${this.t("getRecipe.total")} ${this.view.integer(calories)} ${this.t("getRecipe.macro.kcal")}`;
  }

  back(): void {
    this.router.navigate(["/recipes"]);
  }

  onEdit(): void {
    this.router.navigate(["/recipes", this.id(), "edit"]);
  }

  onDelete(): void {
    this.showDeleteModal.set(true);
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  onConfirmDelete(): void {
    this.deleting.set(true);

    this.deleteRecipeService.deleteRecipe(this.id()).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.router.navigate(["/recipes"]);
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      },
    });
  }
}
