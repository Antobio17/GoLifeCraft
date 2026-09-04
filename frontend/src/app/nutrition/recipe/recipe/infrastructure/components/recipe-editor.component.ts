import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from "@angular/forms";
import { Observable, forkJoin, of, switchMap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { EmojiPickerComponent } from "@shared/design-system/emoji-picker/infrastructure/components/emoji-picker.component";
import { ImagePickerComponent } from "@shared/design-system/image-picker/infrastructure/components/image-picker.component";
import { AggregateImageService } from "@shared/aggregate-image/application/services/aggregate-image.service";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { uuidV4 } from "@shared/uuid/uuid";
import { ChoiceChipsComponent } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { MacroBarsComponent } from "@shared/design-system/macro-bars/infrastructure/components/macro-bars.component";
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { TextareaComponent } from "@shared/design-system/textarea/infrastructure/components/textarea.component";
import { InlineQuantityComponent } from "@shared/design-system/inline-quantity/infrastructure/components/inline-quantity.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { AddTileComponent } from "@shared/design-system/add-tile/infrastructure/components/add-tile.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { SwipeToDeleteComponent } from "@shared/design-system/swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import {
  SegmentedToggleComponent,
  SegmentedOption,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { SkeletonListItemComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list-item.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonFieldsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-fields.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { SkeletonMacroBarsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-macro-bars.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { ChoiceChipOption } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { EmojiCatalogService } from "@nutrition/catalog/article/application/services/emoji-catalog.service";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
import { GetRecipesService } from "@nutrition/recipe/recipe/application/services/get-recipes.service";
import { GetRecipeService } from "@nutrition/recipe/recipe/application/services/get-recipe.service";
import { CreateRecipeService } from "@nutrition/recipe/recipe/application/services/create-recipe.service";
import { UpdateRecipeService } from "@nutrition/recipe/recipe/application/services/update-recipe.service";
import { RecipeCategoryService } from "@nutrition/recipe/recipe/application/services/recipe-category.service";
import {
  FormIngredient,
  FormStep,
  PickableIngredient,
  RecipeFormService,
} from "@nutrition/recipe/recipe/application/services/recipe-form.service";
import {
  MacroShortLabels,
  RecipeViewService,
} from "@nutrition/recipe/recipe/application/services/recipe-view.service";
import { MacroBadgesComponent } from "@shared/design-system/macro-badges/infrastructure/components/macro-badges.component";
import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";
import { RecipeDetail } from "@nutrition/recipe/recipe/domain/models/recipe.model";
import { CreateRecipeRequest } from "@nutrition/recipe/recipe/domain/models/create-recipe.model";

const FALLBACK_EMOJI = "🍲";
const MIN_SERVINGS = 1;
const MAX_SERVINGS = 20;

type PickerTab = "product" | "recipe";

@Component({
  selector: "app-recipe-editor",
  templateUrl: "./recipe-editor.component.html",
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    ScreenHeaderComponent,
    EmojiPickerComponent,
    ImagePickerComponent,
    ChoiceChipsComponent,
    ButtonComponent,
    FieldComponent,
    TextInputComponent,
    CardComponent,
    StackComponent,
    ChipComponent,
    TextComponent,
    SectionHeaderComponent,
    MacroBarsComponent,
    MacroBadgesComponent,
    NumberInputComponent,
    TextareaComponent,
    InlineQuantityComponent,
    IconButtonComponent,
    AddTileComponent,
    EmojiTileComponent,
    SwipeToDeleteComponent,
    EmptyStateComponent,
    SegmentedToggleComponent,
    ModalSheetComponent,
    SearchInputComponent,
    SkeletonListItemComponent,
    SkeletonScreenHeaderComponent,
    SkeletonFieldsComponent,
    SkeletonSectionHeaderComponent,
    SkeletonMacroBarsComponent,
    SkeletonListComponent,
  ],
})
export class RecipeEditorComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private emojiCatalog = inject(EmojiCatalogService);
  private entityVisual = inject(EntityVisualService);
  private categoryService = inject(RecipeCategoryService);
  private recipeForm = inject(RecipeFormService);
  private view = inject(RecipeViewService);
  private getArticlesService = inject(GetArticlesService);
  private getRecipesService = inject(GetRecipesService);
  private getRecipeService = inject(GetRecipeService);
  private createRecipeService = inject(CreateRecipeService);
  private updateRecipeService = inject(UpdateRecipeService);
  private floatingToastService = inject(FloatingToastService);
  private aggregateImageService = inject(AggregateImageService);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/recipe/recipe";
  readonly emojiGroups = this.emojiCatalog.groups();
  readonly fallbackEmoji = FALLBACK_EMOJI;

  form: FormGroup;
  loading = signal(true);
  saving = signal(false);
  storedImage = signal<string | null>(null);
  pickedImage = signal<File | null>(null);
  pickedImagePreview = signal<string | null>(null);
  imageCleared = signal(false);

  imagePreview = computed(() => {
    const picked = this.pickedImagePreview();

    if (null !== picked) {
      return picked;
    }

    return this.aggregateImageService.objectUrl(
      AggregateImageKind.Recipe,
      this.recipeId,
      this.imageCleared() ? null : this.storedImage(),
    )();
  });

  private readonly newRecipeId = uuidV4();

  readonly minServings = MIN_SERVINGS;
  readonly maxServings = MAX_SERVINGS;

  servings = signal(1);
  ingredients = signal<FormIngredient[]>([]);
  steps = signal<FormStep[]>([]);
  stepsLabel = computed(() =>
    this.t("recipeEditor.stepsCount", {
      count: this.recipeForm.writtenSteps(this.steps()).length,
    }),
  );
  readonly categoryOptions: ChoiceChipOption[] = this.categoryService
    .categories()
    .map((category) => ({ value: category, label: category }));

  pickerTabs = computed<SegmentedOption[]>(() => [
    { value: "product", label: this.t("recipeEditor.tabProducts") },
    { value: "recipe", label: this.t("recipeEditor.tabRecipes") },
  ]);

  pickerOpen = signal(false);
  pickerTab = signal<PickerTab>("product");
  pickerQuery = signal("");

  readonly id = input<string>("");

  totals = computed(() => this.recipeForm.totals(this.ingredients()));
  perServing = computed(() =>
    this.recipeForm.perServing(this.ingredients(), this.servings()),
  );

  pickerChoices = computed<PickableIngredient[]>(() =>
    this.pickerTab() === "product"
      ? this.recipeForm.productChoices(this.pickerQuery())
      : this.recipeForm.recipeChoices(this.pickerQuery(), this.id()),
  );

  macroLabels = computed<MacroShortLabels>(() => ({
    protein: this.t("recipeEditor.macro.proteinShort"),
    fat: this.t("recipeEditor.macro.fatShort"),
    carbs: this.t("recipeEditor.macro.carbsShort"),
  }));

  constructor() {
    this.form = this.formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      emoji: [FALLBACK_EMOJI],
      category: ["Comida", [Validators.required]],
    });
  }

  get isEdit(): boolean {
    return !!this.id();
  }

  get title(): string {
    return this.t(
      this.isEdit ? "recipeEditor.editTitle" : "recipeEditor.createTitle",
    );
  }

  get saveLabel(): string {
    return this.t(
      this.isEdit ? "recipeEditor.saveEdit" : "recipeEditor.saveCreate",
    );
  }

  get hasIngredients(): boolean {
    return this.ingredients().length > 0;
  }

  ingredientRows = computed(() =>
    this.ingredients().map((ingredient) => ({
      ingredient,
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Recipe,
        this.entityVisual.kindOf(ingredient.kind),
        ingredient.refId,
        ingredient.image,
      ),
      kcal: this.ingredientKcal(ingredient),
      macros: this.ingredientMacros(ingredient),
      unitLabel: this.ingredientUnitLabel(ingredient),
      unitOptions: this.recipeForm.unitOptions(ingredient),
    })),
  );

  pickerRows = computed(() =>
    this.pickerChoices().map((choice) => ({
      choice,
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Recipe,
        this.entityVisual.kindOf(choice.kind),
        choice.refId,
        choice.image,
      ),
      kcal: this.choiceKcal(choice),
      macros: this.choiceMacros(choice),
    })),
  );

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        forkJoin({
          articles: this.getArticlesService.getArticles(1, 500),
          recipes: this.getRecipesService.getRecipes(1, 500),
        }).subscribe({
          next: ({ articles, recipes }) => {
            this.recipeForm.setProducts(articles.data);
            this.recipeForm.setRecipes(recipes.data);

            if (!this.isEdit) {
              this.loading.set(false);
              return;
            }

            this.loadRecipe();
          },
          error: () => this.loading.set(false),
        });
      });
  }

  totalLabel(): string {
    return `${this.formatMacro(this.totals().calories)} ${this.t("recipeEditor.kcalTotal")}`;
  }

  onIngredientQuantity(key: string, quantity: number): void {
    this.ingredients.update((list) =>
      list.map((ingredient) =>
        ingredient.key === key ? { ...ingredient, quantity } : ingredient,
      ),
    );
  }

  onIngredientUnit(key: string, unit: string): void {
    this.ingredients.update((list) =>
      list.map((ingredient) =>
        ingredient.key === key ? { ...ingredient, unit } : ingredient,
      ),
    );
  }

  onAddStep(): void {
    this.steps.update((steps) => [...steps, this.recipeForm.createStep()]);
  }

  onStepText(key: string, text: string): void {
    this.steps.update((steps) =>
      steps.map((step) => (step.key === key ? { ...step, text } : step)),
    );
  }

  onStepMinutes(key: string, minutes: number): void {
    this.steps.update((steps) =>
      steps.map((step) =>
        step.key === key
          ? { ...step, minutes: minutes > 0 ? minutes : null }
          : step,
      ),
    );
  }

  onRemoveStep(key: string): void {
    this.steps.update((steps) => steps.filter((step) => step.key !== key));
  }

  onRemoveIngredient(key: string): void {
    this.ingredients.update((list) =>
      list.filter((ingredient) => ingredient.key !== key),
    );
  }

  ingredientCalories(ingredient: FormIngredient): string {
    return this.format(this.recipeForm.ingredientCalories(ingredient));
  }

  ingredientKcal(ingredient: FormIngredient): string {
    return `${this.ingredientCalories(ingredient)} ${this.t("recipeEditor.macro.kcal")}`;
  }

  ingredientMacros(ingredient: FormIngredient): MacroBadge[] {
    return this.view.macroItems(
      this.recipeForm.ingredientMacros(ingredient),
      this.macroLabels(),
    );
  }

  isProduct(ingredient: FormIngredient): boolean {
    return "product" === ingredient.kind;
  }

  ingredientUnitLabel(ingredient: FormIngredient): string {
    return this.isProduct(ingredient)
      ? this.recipeForm.unitLabel(ingredient)
      : this.t("recipeEditor.rationUnit");
  }

  formatMacro(value: number): string {
    return this.format(value);
  }

  openPicker(): void {
    this.pickerQuery.set("");
    this.pickerTab.set("product");
    this.pickerOpen.set(true);
  }

  closePicker(): void {
    this.pickerOpen.set(false);
  }

  onPickerTab(tab: string): void {
    this.pickerTab.set(tab as PickerTab);
    this.pickerQuery.set("");
  }

  onPickerSearch(query: string): void {
    this.pickerQuery.set(query);
  }

  choiceKcal(choice: PickableIngredient): string {
    return `${this.format(choice.macros.calories)} ${this.t("recipeEditor.macro.kcal")}`;
  }

  choiceMacros(choice: PickableIngredient): MacroBadge[] {
    return this.view.macroItems(choice.macros, this.macroLabels());
  }

  onPickIngredient(choice: PickableIngredient): void {
    const ingredient = this.recipeForm.createIngredient(
      choice.kind,
      choice.refId,
    );
    this.ingredients.update((list) => [...list, ingredient]);
    this.pickerOpen.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.hasIngredients) {
      this.floatingToastService.showToast({
        status: 400,
        keyTranslation: "recipe.ingredient.required",
        details: [],
      });
      return;
    }

    this.saving.set(true);

    const payload = this.buildPayload();
    const request$ = this.isEdit
      ? this.updateRecipeService.updateRecipe(this.id(), payload)
      : this.createRecipeService.createRecipe(payload);

    request$.pipe(switchMap(() => this.saveImage())).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(["/recipes"]);
      },
      error: () => this.saving.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(this.isEdit ? ["/recipes", this.id()] : ["/recipes"]);
  }

  onImagePicked(file: File): void {
    this.revokePickedImagePreview();
    this.pickedImage.set(file);
    this.pickedImagePreview.set(URL.createObjectURL(file));
    this.imageCleared.set(false);
    this.form.markAsDirty();
  }

  onImageCleared(): void {
    this.revokePickedImagePreview();
    this.pickedImage.set(null);
    this.pickedImagePreview.set(null);
    this.imageCleared.set(true);
    this.form.markAsDirty();
  }

  private get recipeId(): string {
    return this.isEdit ? this.id() : this.newRecipeId;
  }

  private revokePickedImagePreview(): void {
    const preview = this.pickedImagePreview();

    if (null === preview) return;

    URL.revokeObjectURL(preview);
  }

  private saveImage(): Observable<void> {
    const picked = this.pickedImage();

    if (null !== picked) {
      return this.aggregateImageService.upload(
        AggregateImageKind.Recipe,
        this.recipeId,
        picked,
      );
    }

    if (this.imageCleared() && null !== this.storedImage()) {
      return this.aggregateImageService.remove(
        AggregateImageKind.Recipe,
        this.recipeId,
      );
    }

    return of(undefined);
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  private loadRecipe(): void {
    this.getRecipeService.getRecipe(this.id()).subscribe({
      next: (response) => {
        this.patchForm(response.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private patchForm(recipe: RecipeDetail): void {
    this.form.patchValue({
      name: recipe.attributes.name,
      emoji: recipe.attributes.emoji || FALLBACK_EMOJI,
      category: recipe.attributes.category,
    });
    this.storedImage.set(recipe.attributes.image ?? null);
    this.servings.set(recipe.attributes.servings);

    this.steps.set(
      recipe.attributes.steps.map((step) => ({
        key: `step-loaded-${step.position}`,
        text: step.text,
        minutes: step.minutes,
      })),
    );

    this.ingredients.set(
      recipe.attributes.ingredients.map((ingredient, index) => ({
        key: `ing-loaded-${index}-${ingredient.refId}`,
        kind: ingredient.kind,
        refId: ingredient.refId,
        name: ingredient.name,
        emoji: ingredient.emoji,
        image: ingredient.image,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      })),
    );
  }

  private buildPayload(): CreateRecipeRequest {
    const value = this.form.value;

    return {
      id: this.recipeId,
      name: (value.name ?? "").trim(),
      emoji: value.emoji || FALLBACK_EMOJI,
      category: value.category,
      servings: this.servings(),
      ingredients: this.ingredients().map((ingredient, index) => ({
        kind: ingredient.kind,
        refId: ingredient.refId,
        quantity: Number(ingredient.quantity) || 0,
        unit: this.isProduct(ingredient) ? ingredient.unit : null,
        position: index + 1,
      })),
      steps: this.recipeForm.writtenSteps(this.steps()).map((step, index) => ({
        position: index + 1,
        text: step.text.trim(),
        minutes: step.minutes,
      })),
    };
  }

  private format(value: number): string {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  }
}
