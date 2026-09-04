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
import { Subject, forkJoin, merge, of } from "rxjs";
import { catchError, debounceTime, switchMap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { CheckRowComponent } from "@shared/design-system/check-row/infrastructure/components/check-row.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { InlineQuantityComponent } from "@shared/design-system/inline-quantity/infrastructure/components/inline-quantity.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { AddTileComponent } from "@shared/design-system/add-tile/infrastructure/components/add-tile.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { SwipeToDeleteComponent } from "@shared/design-system/swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { ChoiceRowComponent } from "@shared/design-system/choice-row/infrastructure/components/choice-row.component";
import {
  SegmentedToggleComponent,
  SegmentedOption,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
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
import { AdjustProductionItemIngredientsService } from "@nutrition/kitchen/production/application/services/adjust-production-item-ingredients.service";
import { LabelProductionItemService } from "@nutrition/kitchen/production/application/services/label-production-item.service";
import { ServeProductionItemSubRecipeService } from "@nutrition/kitchen/production/application/services/serve-production-item-sub-recipe.service";
import { GetRecipeLotsService } from "@nutrition/kitchen/production/application/services/get-recipe-lots.service";
import { ProductionLotLabels } from "@nutrition/kitchen/production/domain/models/production-lot-labels.model";
import { ProductionLotRow } from "@nutrition/kitchen/production/domain/models/production-lot-row.model";
import { ProductionIngredientFormService } from "@nutrition/kitchen/production/application/services/production-ingredient-form.service";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
import { GetRecipesService } from "@nutrition/recipe/recipe/application/services/get-recipes.service";
import { ProductionViewService } from "@nutrition/kitchen/production/application/services/production-view.service";
import { ProductionRecipeAttributes } from "@nutrition/kitchen/production/domain/models/production-recipe-attributes.model";
import { ProductionItemStatus } from "@nutrition/kitchen/production/domain/models/production-item-status.model";
import { IngredientRow } from "@nutrition/kitchen/production/domain/models/ingredient-row.model";
import { StepRow } from "@nutrition/kitchen/production/domain/models/step-row.model";
import { SubRecipeRow } from "@nutrition/kitchen/production/domain/models/sub-recipe-row.model";
import { EditableIngredient } from "@nutrition/kitchen/production/domain/models/editable-ingredient.model";
import { EditableIngredientRow } from "@nutrition/kitchen/production/domain/models/editable-ingredient-row.model";
import { IngredientChoice } from "@nutrition/kitchen/production/domain/models/ingredient-choice.model";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";

const CHECKLIST_SAVE_DEBOUNCE_MS = 400;
const LABEL_SAVE_DEBOUNCE_MS = 600;

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
    TextComponent,
    HeadingComponent,
    ButtonComponent,
    NumberInputComponent,
    SectionHeaderComponent,
    CheckRowComponent,
    CardComponent,
    ChipComponent,
    FieldComponent,
    TextInputComponent,
    InlineQuantityComponent,
    IconButtonComponent,
    AddTileComponent,
    EmojiTileComponent,
    SwipeToDeleteComponent,
    ModalSheetComponent,
    ChoiceRowComponent,
    SearchInputComponent,
    SegmentedToggleComponent,
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
  private entityVisual = inject(EntityVisualService);
  private getProductionRecipeService = inject(GetProductionRecipeService);
  private cookProductionItemService = inject(CookProductionItemService);
  private uncookProductionItemService = inject(UncookProductionItemService);
  private checkProductionItemService = inject(CheckProductionItemService);
  private adjustIngredientsService = inject(
    AdjustProductionItemIngredientsService,
  );
  private labelProductionItemService = inject(LabelProductionItemService);
  private serveSubRecipeService = inject(ServeProductionItemSubRecipeService);
  private getRecipeLotsService = inject(GetRecipeLotsService);
  private getArticlesService = inject(GetArticlesService);
  private getRecipesService = inject(GetRecipesService);
  protected ingredientForm = inject(ProductionIngredientFormService);
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
  editing = signal(false);
  catalogLoaded = signal(false);
  savingIngredients = signal(false);
  restoring = signal(false);
  draft = signal<EditableIngredient[]>([]);
  pickerOpen = signal(false);
  pickerTab = signal<"product" | "recipe">("product");
  pickerQuery = signal("");
  label = signal("");
  lotSubRecipeId = signal<string | null>(null);
  lotSelectedId = signal<string | null>(null);
  lotRows = signal<ProductionLotRow[]>([]);
  lotLoading = signal(false);
  lotSaving = signal(false);

  private checklistSaves = new Subject<void>();
  private labelSaves = new Subject<void>();
  private reloads = new Subject<void>();

  private target = computed(() => ({
    productionId: this.id(),
    itemId: this.itemId(),
  }));

  done = computed(() => ProductionItemStatus.Done === this.recipe()?.status);

  statusLabel = computed(() =>
    this.t(
      this.done()
        ? "getProductionRecipe.status.done"
        : "getProductionRecipe.status.pending",
    ),
  );

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
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Kitchen,
        AggregateImageKind.Article,
        ingredient.articleId,
        ingredient.image,
      ),
      meta: this.view.quantityLabel(
        this.view.scale(ingredient.quantity, base, this.servings()),
        ingredient.unit,
      ),
      checked: this.checkedIngredients().has(ingredient.articleId),
    }));
  });

  lotOpen = computed(() => null !== this.lotSubRecipeId());

  lotLabels = computed<ProductionLotLabels>(() => ({
    untitled: this.t("getProductionRecipe.lotUntitled"),
    left: (servings: string) =>
      this.t("getProductionRecipe.lotLeft", { servings }),
    gone: this.t("getProductionRecipe.lotGone"),
    changed: this.t("getProductionRecipe.customizedChip"),
  }));

  subRecipeRows = computed<SubRecipeRow[]>(() =>
    (this.recipe()?.subRecipes ?? []).map((item) => ({
      item,
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Kitchen,
        AggregateImageKind.Recipe,
        item.recipeId,
        item.image,
      ),
      lotLabel: this.view.lotLabel(item, this.t("getProductionRecipe.lotNone")),
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

  customized = computed(() => true === this.recipe()?.customized);

  lotCode = computed(() => this.recipe()?.code ?? "");

  draftRows = computed<EditableIngredientRow[]>(() =>
    this.draft().map((ingredient) => ({
      ingredient,
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Kitchen,
        "recipe" === ingredient.kind
          ? AggregateImageKind.Recipe
          : AggregateImageKind.Article,
        ingredient.refId,
        ingredient.image,
      ),
      unitLabel: this.ingredientForm.unitLabel(ingredient),
      unitOptions: this.ingredientForm.unitOptions(ingredient),
    })),
  );

  choiceImageUrl(choice: IngredientChoice): string | null {
    return this.entityVisual.urlOf(
      VisualSurface.Kitchen,
      "recipe" === choice.kind
        ? AggregateImageKind.Recipe
        : AggregateImageKind.Article,
      choice.refId,
      choice.image,
    );
  }

  pickerTabs = computed<SegmentedOption[]>(() => [
    { value: "product", label: this.t("getProductionRecipe.pickerProducts") },
    { value: "recipe", label: this.t("getProductionRecipe.pickerRecipes") },
  ]);

  pickerChoices = computed<IngredientChoice[]>(() =>
    "product" === this.pickerTab()
      ? this.ingredientForm.productChoices(this.pickerQuery())
      : this.ingredientForm.recipeChoices(
          this.pickerQuery(),
          this.recipe()?.recipeId ?? "",
        ),
  );

  plannedHint = computed(() =>
    this.t("getProductionRecipe.editHint", {
      servings: this.view.servings(this.recipe()?.servingsPlanned ?? 0),
    }),
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

    merge(toObservable(this.target), this.reloads)
      .pipe(
        switchMap(() => {
          this.loading.set(true);

          return this.getProductionRecipeService
            .getProductionRecipe(this.id(), this.itemId())
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
        this.checkedSteps.set(
          new Set((attributes?.checkedStepPositions ?? []).map(String)),
        );
        this.servings.set(this.servingsOf(attributes));
        this.label.set(attributes?.label ?? "");
        this.editing.set(false);
        this.loading.set(false);
      });

    this.labelSaves
      .pipe(
        debounceTime(LABEL_SAVE_DEBOUNCE_MS),
        switchMap(() =>
          this.labelProductionItemService.labelProductionItem(
            this.id(),
            this.itemId(),
            this.label(),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.checklistSaves
      .pipe(
        debounceTime(CHECKLIST_SAVE_DEBOUNCE_MS),
        switchMap(() =>
          this.checkProductionItemService.checkProductionItem(
            this.id(),
            this.itemId(),
            [...this.checkedIngredients()],
            [...this.checkedSteps()].map(Number),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  onServings(value: number): void {
    this.servings.set(Math.max(1, value));
  }

  onToggleIngredient(key: string): void {
    if (this.done()) return;

    this.checkedIngredients.set(
      this.view.toggle(this.checkedIngredients(), key),
    );
    this.saveChecklist();
  }

  onToggleStep(key: string): void {
    if (this.done()) return;

    this.checkedSteps.set(this.view.toggle(this.checkedSteps(), key));
    this.saveChecklist();
  }

  onEdit(): void {
    if (this.done()) return;

    this.draft.set(this.currentDraft());
    this.editing.set(true);

    if (this.catalogLoaded()) return;

    forkJoin({
      articles: this.getArticlesService.getArticles(1, 500),
      recipes: this.getRecipesService.getRecipes(1, 500),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ articles, recipes }) => {
          this.ingredientForm.setProducts(articles.data);
          this.ingredientForm.setRecipes(recipes.data);
          this.catalogLoaded.set(true);
        },
      });
  }

  onCancelEdit(): void {
    this.editing.set(false);
    this.draft.set([]);
  }

  onDraftQuantity(key: string, quantity: number): void {
    this.draft.update((ingredients) =>
      ingredients.map((ingredient) =>
        ingredient.key === key ? { ...ingredient, quantity } : ingredient,
      ),
    );
  }

  onDraftUnit(key: string, unit: string): void {
    this.draft.update((ingredients) =>
      ingredients.map((ingredient) =>
        ingredient.key === key ? { ...ingredient, unit } : ingredient,
      ),
    );
  }

  onRemoveDraft(key: string): void {
    this.draft.update((ingredients) =>
      ingredients.filter((ingredient) => ingredient.key !== key),
    );
  }

  onOpenLotPicker(
    subRecipeId: string,
    sourceProductionItemId: string | null,
  ): void {
    if (this.done()) return;

    this.lotSubRecipeId.set(subRecipeId);
    this.lotSelectedId.set(sourceProductionItemId);
    this.lotRows.set([]);
    this.lotLoading.set(true);

    this.getRecipeLotsService
      .getRecipeLots(subRecipeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.lotRows.set(
            this.view.lotRows(
              response.data,
              this.lotSelectedId(),
              this.lotLabels(),
            ),
          );
          this.lotLoading.set(false);
        },
        error: () => this.lotLoading.set(false),
      });
  }

  onCloseLotPicker(): void {
    this.lotSubRecipeId.set(null);
    this.lotRows.set([]);
  }

  onPickLot(sourceProductionItemId: string | null): void {
    const subRecipeId = this.lotSubRecipeId();
    if (null === subRecipeId || this.lotSaving()) return;

    this.lotSaving.set(true);

    this.serveSubRecipeService
      .serveProductionItemSubRecipe(
        this.id(),
        this.itemId(),
        subRecipeId,
        sourceProductionItemId,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.lotSaving.set(false);
          this.onCloseLotPicker();
          this.reload();
        },
        error: () => this.lotSaving.set(false),
      });
  }

  onOpenPicker(): void {
    this.pickerQuery.set("");
    this.pickerOpen.set(true);
  }

  onClosePicker(): void {
    this.pickerOpen.set(false);
  }

  onPickerTab(tab: string): void {
    this.pickerTab.set("recipe" === tab ? "recipe" : "product");
  }

  onPickerSearch(query: string): void {
    this.pickerQuery.set(query);
  }

  onPickIngredient(choice: IngredientChoice): void {
    this.draft.update((ingredients) => [
      ...ingredients,
      this.ingredientForm.createIngredient(choice),
    ]);
    this.pickerOpen.set(false);
  }

  onSaveIngredients(): void {
    if (this.savingIngredients()) return;

    const ingredients = this.ingredientForm.toInputs(this.draft());
    if (0 === ingredients.length) return;

    this.savingIngredients.set(true);

    this.adjustIngredientsService
      .adjustProductionItemIngredients(this.id(), this.itemId(), ingredients)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.savingIngredients.set(false);
          this.editing.set(false);
          this.reload();
        },
        error: () => this.savingIngredients.set(false),
      });
  }

  onRestoreIngredients(): void {
    if (this.restoring()) return;

    this.restoring.set(true);

    this.adjustIngredientsService
      .restoreProductionItemIngredients(this.id(), this.itemId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.restoring.set(false);
          this.editing.set(false);
          this.reload();
        },
        error: () => this.restoring.set(false),
      });
  }

  onLabel(label: string): void {
    this.label.set(label);
    this.labelSaves.next();
  }

  private currentDraft(): EditableIngredient[] {
    const recipe = this.recipe();
    if (!recipe) return [];

    return this.ingredientForm.fromCooked(
      recipe.ingredients,
      recipe.subRecipes,
    );
  }

  private reload(): void {
    this.reloads.next();
  }

  private servingsOf(recipe: ProductionRecipeAttributes | null): number {
    if (null === recipe) return 1;

    if (ProductionItemStatus.Done === recipe.status)
      return recipe.servingsCooked;

    return recipe.servingsPlanned;
  }

  private saveChecklist(): void {
    this.checklistSaves.next();
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
    if (this.uncooking() || !this.done()) return;

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
    if (this.cooking() || this.done()) return;

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
