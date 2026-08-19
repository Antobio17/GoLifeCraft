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
import { forkJoin } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { EmojiPickerComponent } from "@shared/design-system/emoji-picker/infrastructure/components/emoji-picker.component";
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
import { InlineQuantityComponent } from "@shared/design-system/inline-quantity/infrastructure/components/inline-quantity.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { AddTileComponent } from "@shared/design-system/add-tile/infrastructure/components/add-tile.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { SwipeToDeleteComponent } from "@shared/design-system/swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import {
  SegmentedToggleComponent,
  SegmentedOption,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
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
import { DeleteRecipeService } from "@nutrition/recipe/recipe/application/services/delete-recipe.service";
import { RecipeCategoryService } from "@nutrition/recipe/recipe/application/services/recipe-category.service";
import {
  FormIngredient,
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
    InlineQuantityComponent,
    IconButtonComponent,
    AddTileComponent,
    EmojiTileComponent,
    SwipeToDeleteComponent,
    EmptyStateComponent,
    SegmentedToggleComponent,
    ModalSheetComponent,
    SearchInputComponent,
    ConfirmActionModalComponent,
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
  private categoryService = inject(RecipeCategoryService);
  private recipeForm = inject(RecipeFormService);
  private view = inject(RecipeViewService);
  private getArticlesService = inject(GetArticlesService);
  private getRecipesService = inject(GetRecipesService);
  private getRecipeService = inject(GetRecipeService);
  private createRecipeService = inject(CreateRecipeService);
  private updateRecipeService = inject(UpdateRecipeService);
  private deleteRecipeService = inject(DeleteRecipeService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/recipe/recipe";
  readonly emojiGroups = this.emojiCatalog.groups();
  readonly fallbackEmoji = FALLBACK_EMOJI;

  form: FormGroup;
  loading = signal(true);
  saving = signal(false);
  showDeleteModal = signal(false);
  deleting = signal(false);

  readonly minServings = MIN_SERVINGS;
  readonly maxServings = MAX_SERVINGS;

  servings = signal(1);
  ingredients = signal<FormIngredient[]>([]);
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
      kcal: this.ingredientKcal(ingredient),
      macros: this.ingredientMacros(ingredient),
      unitLabel: this.ingredientUnitLabel(ingredient),
      unitOptions: this.recipeForm.unitOptions(ingredient),
    })),
  );

  pickerRows = computed(() =>
    this.pickerChoices().map((choice) => ({
      choice,
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

    request$.subscribe({
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

  t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
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
    this.servings.set(recipe.attributes.servings);

    this.ingredients.set(
      recipe.attributes.ingredients.map((ingredient, index) => ({
        key: `ing-loaded-${index}-${ingredient.refId}`,
        kind: ingredient.kind,
        refId: ingredient.refId,
        name: ingredient.name,
        emoji: ingredient.emoji,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      })),
    );
  }

  private buildPayload(): CreateRecipeRequest {
    const value = this.form.value;

    return {
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
    };
  }

  private format(value: number): string {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  }
}
