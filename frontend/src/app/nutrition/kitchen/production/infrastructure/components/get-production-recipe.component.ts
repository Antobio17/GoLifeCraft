import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { CheckRowComponent } from "@shared/design-system/check-row/infrastructure/components/check-row.component";
import { CtaRowComponent } from "@shared/design-system/cta-row/infrastructure/components/cta-row.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonHeroComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-hero.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { GetProductionRecipeService } from "@nutrition/kitchen/production/application/services/get-production-recipe.service";
import { CookProductionItemService } from "@nutrition/kitchen/production/application/services/cook-production-item.service";
import { UncookProductionItemService } from "@nutrition/kitchen/production/application/services/uncook-production-item.service";
import { CheckProductionItemService } from "@nutrition/kitchen/production/application/services/check-production-item.service";
import { ProductionViewService } from "@nutrition/kitchen/production/application/services/production-view.service";
import { ProductionRecipeAttributes } from "@nutrition/kitchen/production/domain/models/production-recipe-attributes.model";
import { ProductionItemStatus } from "@nutrition/kitchen/production/domain/models/production-item-status.model";
import { ProductionStatus } from "@nutrition/kitchen/production/domain/models/production-status.model";
import { IngredientRow } from "@nutrition/kitchen/production/domain/models/ingredient-row.model";
import { StepRow } from "@nutrition/kitchen/production/domain/models/step-row.model";
import { SubRecipeRow } from "@nutrition/kitchen/production/domain/models/sub-recipe-row.model";

@Component({
  selector: "app-get-production-recipe",
  templateUrl: "./get-production-recipe.component.html",
  styleUrls: ["./get-production-recipe.component.css"],
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    RevealDirective,
    PageWrapperComponent,
    SplitViewComponent,
    ScreenHeaderComponent,
    StackComponent,
    HeadingComponent,
    TextComponent,
    ChipComponent,
    ButtonComponent,
    NumberInputComponent,
    EmojiTileComponent,
    SectionHeaderComponent,
    CheckRowComponent,
    CtaRowComponent,
    EmptyStateComponent,
    SkeletonScreenHeaderComponent,
    SkeletonHeroComponent,
    SkeletonSectionHeaderComponent,
    SkeletonListComponent,
  ],
})
export class GetProductionRecipeComponent {
  private translationService = inject(TranslationService);
  private getProductionRecipeService = inject(GetProductionRecipeService);
  private cookProductionItemService = inject(CookProductionItemService);
  private uncookProductionItemService = inject(UncookProductionItemService);
  private checkProductionItemService = inject(CheckProductionItemService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  protected view = inject(ProductionViewService);

  private readonly MODULE_PATH = "nutrition/kitchen/production";

  readonly id = input.required<string>();
  readonly itemId = input.required<string>();

  loading = signal(true);
  recipe = signal<ProductionRecipeAttributes | null>(null);
  servings = signal(1);
  checkedIngredients = signal<ReadonlySet<string>>(new Set());
  checkedSteps = signal<ReadonlySet<string>>(new Set());
  cooking = signal(false);
  uncooking = signal(false);

  done = computed(() => ProductionItemStatus.Done === this.recipe()?.status);

  /** Un lote cerrado no se toca: la receta se ve, pero no se cocina ni se ajusta. */
  locked = computed(
    () => ProductionStatus.Done === this.recipe()?.productionStatus,
  );

  editable = computed(() => !this.done() && !this.locked());

  undoable = computed(() => this.done() && !this.locked());

  statusLabel = computed(() =>
    this.t(
      this.done()
        ? "getProductionRecipe.status.done"
        : "getProductionRecipe.status.pending",
    ),
  );

  recipeServingsLabel = computed(() => {
    const recipe = this.recipe();
    if (!recipe) return "";

    return this.t("getProductionRecipe.recipeServings", {
      servings: this.view.servings(recipe.recipeServings),
    });
  });

  servingsHint = computed(() => {
    const recipe = this.recipe();
    if (!recipe) return "";

    if (recipe.servingsPlanned === this.servings()) {
      return this.t("getProductionRecipe.servingsHint");
    }

    return this.t("getProductionRecipe.servingsChanged", {
      servings: this.view.servings(recipe.servingsPlanned),
    });
  });

  ingredientRows = computed<IngredientRow[]>(() => {
    const recipe = this.recipe();
    if (!recipe) return [];

    const base = this.done() ? recipe.servingsCooked : recipe.servingsPlanned;

    return recipe.ingredients.map((ingredient) => ({
      key: ingredient.articleId,
      name: ingredient.name,
      emoji: ingredient.emoji,
      meta: this.view.quantityLabel(
        this.view.scale(ingredient.quantity, base, this.servings()),
        ingredient.unit,
      ),
      checked: this.checkedIngredients().has(ingredient.articleId),
    }));
  });

  subRecipeRows = computed<SubRecipeRow[]>(() =>
    (this.recipe()?.subRecipes ?? []).map((item) => ({
      item,
      meta:
        item.inStock >= item.servings
          ? this.t("getProductionRecipe.subRecipe.ready", {
              servings: this.view.servings(item.servings),
              stock: this.view.servings(item.inStock),
            })
          : this.t("getProductionRecipe.subRecipe.short", {
              servings: this.view.servings(item.servings),
              stock: this.view.servings(item.inStock),
            }),
      short: item.inStock < item.servings,
      checked: this.checkedIngredients().has(item.recipeId),
    })),
  );

  stepRows = computed<StepRow[]>(() =>
    (this.recipe()?.steps ?? []).map((step) => ({
      key: `${step.position}`,
      eyebrow: this.t("getProductionRecipe.step", { position: step.position }),
      text: step.text,
      chip: step.minutes
        ? this.t("getProductionRecipe.minutes", { minutes: step.minutes })
        : "",
      checked: this.checkedSteps().has(`${step.position}`),
    })),
  );

  ingredientsProgress = computed(() =>
    this.view.progressLabel(
      this.ingredientRows().filter((row) => row.checked).length +
        this.subRecipeRows().filter((row) => row.checked).length,
      this.ingredientRows().length + this.subRecipeRows().length,
    ),
  );

  stepsProgress = computed(() =>
    this.view.progressLabel(
      this.stepRows().filter((row) => row.checked).length,
      this.stepRows().length,
    ),
  );

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);

    toObservable(computed(() => `${this.id()}|${this.itemId()}`))
      .pipe(
        switchMap((key) => {
          const [productionId, itemId] = key.split("|");

          this.loading.set(true);
          this.checkedSteps.set(new Set());

          return this.getProductionRecipeService
            .getProductionRecipe(productionId, itemId)
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        const attributes = response?.data.attributes ?? null;

        this.recipe.set(attributes);
        this.checkedIngredients.set(
          new Set(attributes?.checkedArticleIds ?? []),
        );
        this.servings.set(
          attributes
            ? ProductionItemStatus.Done === attributes.status
              ? attributes.servingsCooked
              : attributes.servingsPlanned
            : 1,
        );
        this.loading.set(false);
      });
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  onServings(value: number): void {
    this.servings.set(Math.max(1, value));
  }

  onToggleIngredient(key: string): void {
    if (!this.editable()) return;

    const checked = this.view.toggle(this.checkedIngredients(), key);
    this.checkedIngredients.set(checked);

    this.checkProductionItemService
      .checkProductionItem(this.id(), this.itemId(), [...checked])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onToggleStep(key: string): void {
    this.checkedSteps.set(this.view.toggle(this.checkedSteps(), key));
  }

  onBack(): void {
    this.router.navigate(["/cocina", this.id()]);
  }

  onOpenRecipe(): void {
    const recipe = this.recipe();
    if (!recipe) return;

    this.router.navigate(["/recipes", recipe.recipeId]);
  }

  onUncook(): void {
    if (this.uncooking() || !this.undoable()) return;

    this.uncooking.set(true);

    this.uncookProductionItemService
      .uncookProductionItem(this.id(), this.itemId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.uncooking.set(false);
          this.onBack();
        },
        error: () => this.uncooking.set(false),
      });
  }

  onCook(): void {
    if (this.cooking() || !this.editable()) return;

    this.cooking.set(true);

    this.cookProductionItemService
      .cookProductionItem(this.id(), this.itemId(), {
        servingsCooked: this.servings(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cooking.set(false);
          this.onBack();
        },
        error: () => this.cooking.set(false),
      });
  }
}
