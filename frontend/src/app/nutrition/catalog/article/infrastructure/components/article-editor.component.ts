import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Observable, forkJoin, of, switchMap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { EmojiPickerComponent } from "@shared/design-system/emoji-picker/infrastructure/components/emoji-picker.component";
import { ImagePickerComponent } from "@shared/design-system/image-picker/infrastructure/components/image-picker.component";
import { SelectChipsComponent } from "@shared/design-system/select-chips/infrastructure/components/select-chips.component";
import { PriceInputComponent } from "@shared/design-system/price-input/infrastructure/components/price-input.component";
import { NutrientInputComponent } from "@shared/design-system/nutrient-input/infrastructure/components/nutrient-input.component";
import { NutritionEditorComponent } from "@shared/design-system/nutrition-editor/infrastructure/components/nutrition-editor.component";
import { EquivalenceEditorComponent } from "@shared/design-system/equivalence-editor/infrastructure/components/equivalence-editor.component";
import { EquivalenceEditorValue } from "@shared/design-system/equivalence-editor/domain/models/equivalence-editor.model";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { ArticleFormSkeletonComponent } from "./article-form-skeleton.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { AggregateImageService } from "@shared/aggregate-image/application/services/aggregate-image.service";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { uuidV4 } from "@shared/uuid/uuid";
import { GetCategoriesService } from "@nutrition/catalog/category/application/services/get-categories.service";
import { GetSupermarketsService } from "@nutrition/catalog/supermarket/application/services/get-supermarkets.service";
import { AisleCatalogService } from "@nutrition/catalog/supermarket/application/services/aisle-catalog.service";
import { Supermarket } from "@nutrition/catalog/supermarket/domain/models/supermarket.model";
import { ManageAislesComponent } from "@nutrition/catalog/supermarket/infrastructure/components/manage-aisles.component";
import { EmojiCatalogService } from "../../application/services/emoji-catalog.service";
import { UnitCatalogService } from "../../application/services/unit-catalog.service";
import { ArticleDraftStoreService } from "../../application/services/article-draft-store.service";
import { ArticleDraft } from "../../domain/models/article-draft.model";
import { CreateArticleService } from "../../application/services/create-article.service";
import { UpdateArticleService } from "../../application/services/update-article.service";
import { GetArticleService } from "../../application/services/get-article.service";
import { Article } from "../../domain/models/article.model";
import {
  ArticleNutritionRequest,
  CreateArticleRequest,
} from "../../domain/models/create-article.model";

const FALLBACK_EMOJI = "🍽️";
const REFERENCE_AMOUNT = 100;
const DEFAULT_BASE_UNIT = "g";

function defaultUnitsValue(): EquivalenceEditorValue {
  return {
    baseUnit: DEFAULT_BASE_UNIT,
    recipeUnit: DEFAULT_BASE_UNIT,
    diaryUnit: DEFAULT_BASE_UNIT,
    packUnit: null,
    equivalences: [],
  };
}

function equivalencesValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value = control.value as EquivalenceEditorValue | null;
  if (!value) {
    return null;
  }

  const hasIncompleteLine = value.equivalences.some(
    (line) =>
      "" === (line.unit ?? "").trim() ||
      null === line.quantity ||
      line.quantity <= 0,
  );

  return hasIncompleteLine ? { incompleteEquivalence: true } : null;
}

@Component({
  selector: "app-article-editor",
  templateUrl: "./article-editor.component.html",
  styleUrl: "./article-editor.component.scss",
  imports: [
    ReactiveFormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    ScreenHeaderComponent,
    FieldComponent,
    TextInputComponent,
    EmojiPickerComponent,
    ImagePickerComponent,
    SelectChipsComponent,
    PriceInputComponent,
    NutrientInputComponent,
    NutritionEditorComponent,
    EquivalenceEditorComponent,
    ButtonComponent,
    StackComponent,
    TextComponent,
    NoteComponent,
    ArticleFormSkeletonComponent,
    ManageAislesComponent,
  ],
})
export class ArticleEditorComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private createArticleService = inject(CreateArticleService);
  private updateArticleService = inject(UpdateArticleService);
  private getArticleService = inject(GetArticleService);
  private getCategoriesService = inject(GetCategoriesService);
  private getSupermarketsService = inject(GetSupermarketsService);
  private aisleCatalog = inject(AisleCatalogService);
  private emojiCatalog = inject(EmojiCatalogService);
  private unitCatalogService = inject(UnitCatalogService);
  private articleDraftStore = inject(ArticleDraftStoreService);
  private floatingToastService = inject(FloatingToastService);
  private aggregateImageService = inject(AggregateImageService);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/catalog/article";
  readonly emojiGroups = this.emojiCatalog.groups();
  readonly fallbackEmoji = FALLBACK_EMOJI;
  readonly unitOptions = this.unitCatalogService.options();

  categoryOptions = signal<{ value: string; label: string }[]>([]);
  supermarkets = signal<Supermarket[]>([]);
  selectedSupermarketId = signal<string | null>(null);

  supermarketOptions = computed(() =>
    this.supermarkets().map((supermarket) => ({
      value: supermarket.id,
      label: supermarket.attributes.name,
    })),
  );

  selectedSupermarket = computed(() =>
    this.aisleCatalog.findById(
      this.supermarkets(),
      this.selectedSupermarketId(),
    ),
  );

  aisleOptions = computed(() =>
    this.aisleCatalog
      .aislesOf(this.selectedSupermarket())
      .map((aisle) => ({ value: aisle.id, label: aisle.name })),
  );

  draftLowConfidenceLabel = computed(() => {
    const labels = this.draftLowConfidenceFields()
      .map((field) => this.draftFieldLabel(field))
      .filter((label): label is string => null !== label);

    if (0 === labels.length) {
      return "";
    }

    return this.t("articleEditor.draftLowConfidence", {
      fields: labels.join(", "),
    });
  });

  hasSupermarket = computed(() => null !== this.selectedSupermarketId());
  hasAisles = computed(() => this.aisleOptions().length > 0);

  aisleSectionLabel = computed(() => {
    const supermarket = this.selectedSupermarket();
    if (!supermarket) return this.t("articleEditor.field.aisle");

    return this.t("articleEditor.field.aisleIn", {
      store: supermarket.attributes.name,
    });
  });

  form: FormGroup;
  loading = signal(true);
  fromDraft = signal(false);
  draftLowConfidenceFields = signal<string[]>([]);
  saving = signal(false);
  articleName = signal("");
  aisleSheetOpen = signal(false);
  storedImage = signal<string | null>(null);
  pickedImage = signal<File | null>(null);
  pickedImagePreview = signal<string | null>(null);
  imageCleared = signal(false);

  readonly id = input<string>("");

  imagePreview = computed(() => {
    const picked = this.pickedImagePreview();

    if (null !== picked) {
      return picked;
    }

    return this.aggregateImageService.objectUrl(
      AggregateImageKind.Article,
      this.articleId,
      this.imageCleared() ? null : this.storedImage(),
    )();
  });

  private readonly newArticleId = uuidV4();

  constructor() {
    this.form = this.formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      emoji: [""],
      brand: [""],
      price: [""],
      categoryId: [null as string | null],
      supermarketId: [null as string | null],
      aisleId: [null as string | null],
      units: [defaultUnitsValue(), equivalencesValidator],
      calories: [""],
      protein: [""],
      fat: [""],
      saturatedFat: [""],
      carbs: [""],
      sugars: [""],
      salt: [""],
    });

    this.form.controls["supermarketId"].valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((supermarketId) =>
        this.onSupermarketChange(supermarketId as string | null),
      );
  }

  get isEdit(): boolean {
    return !!this.id();
  }

  get title(): string {
    return this.t(
      this.isEdit ? "articleEditor.editTitle" : "articleEditor.createTitle",
    );
  }

  get saveLabel(): string {
    return this.t(
      this.isEdit ? "articleEditor.saveEdit" : "articleEditor.saveCreate",
    );
  }

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        forkJoin({
          categories: this.getCategoriesService.getCategories(1, 100),
          supermarkets: this.getSupermarketsService.getSupermarkets(1, 100),
        }).subscribe({
          next: ({ categories, supermarkets }) => {
            this.categoryOptions.set(
              categories.data.map((item) => ({
                value: item.id,
                label: item.attributes.name,
              })),
            );
            this.supermarkets.set(supermarkets.data);

            if (!this.isEdit) {
              this.applyDraft();
              this.loading.set(false);
              return;
            }

            this.loadArticle();
          },
          error: () => this.loading.set(false),
        });
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.get("units")?.hasError("incompleteEquivalence")) {
        this.floatingToastService.showToast({
          status: 400,
          keyTranslation: "article.equivalence.incomplete",
          details: [],
        });
      }
      return;
    }

    this.saving.set(true);

    const payload = this.buildPayload();
    const request$ = this.isEdit
      ? this.updateArticleService.updateArticle(this.id(), payload)
      : this.createArticleService.createArticle(payload);

    request$.pipe(switchMap(() => this.saveImage())).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(["/catalog"]);
      },
      error: () => this.saving.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(this.isEdit ? ["/catalog", this.id()] : ["/catalog"]);
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

  private get articleId(): string {
    return this.isEdit ? this.id() : this.newArticleId;
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
        AggregateImageKind.Article,
        this.articleId,
        picked,
      );
    }

    if (this.imageCleared() && null !== this.storedImage()) {
      return this.aggregateImageService.remove(
        AggregateImageKind.Article,
        this.articleId,
      );
    }

    return of(undefined);
  }

  openAisleSheet(): void {
    this.aisleSheetOpen.set(true);
  }

  closeAisleSheet(): void {
    this.aisleSheetOpen.set(false);
  }

  onAislesSaved(): void {
    this.getSupermarketsService.getSupermarkets(1, 100).subscribe({
      next: (response) => {
        this.supermarkets.set(response.data);
        this.dropUnknownAisle();
      },
    });
  }

  private onSupermarketChange(supermarketId: string | null): void {
    this.selectedSupermarketId.set(supermarketId);
    this.dropUnknownAisle();
  }

  private dropUnknownAisle(): void {
    const aisleId = this.form.get("aisleId")?.value as string | null;
    if (!aisleId) return;

    if (this.aisleOptions().some((option) => option.value === aisleId)) return;

    this.form.patchValue({ aisleId: null });
  }

  private applyDraft(): void {
    const stored = this.articleDraftStore.take();

    if (null === stored) {
      return;
    }

    this.fromDraft.set(true);
    this.draftLowConfidenceFields.set(stored.lowConfidenceFields);
    this.patchDraft(stored.draft);
    this.form.markAsDirty();
  }

  private patchDraft(draft: ArticleDraft): void {
    const nutrition = draft.nutrition;

    this.form.patchValue({
      name: draft.name ?? "",
      emoji: draft.emoji ?? "",
      brand: draft.brand ?? "",
      price: this.formatNumber(draft.price),
      categoryId: draft.categoryId,
      supermarketId: draft.supermarketId,
      aisleId: draft.aisleId,
      units: {
        baseUnit: draft.baseUnit,
        recipeUnit: draft.recipeUnit,
        diaryUnit: draft.diaryUnit,
        packUnit: draft.packUnit,
        equivalences: draft.equivalences.map((item) => ({
          unit: item.unit,
          quantity: item.quantity,
        })),
      },
      calories: this.formatNumber(nutrition?.calories ?? null),
      protein: this.formatNumber(nutrition?.protein ?? null),
      fat: this.formatNumber(nutrition?.fat ?? null),
      saturatedFat: this.formatNumber(nutrition?.saturatedFat ?? null),
      carbs: this.formatNumber(nutrition?.carbs ?? null),
      sugars: this.formatNumber(nutrition?.sugars ?? null),
      salt: this.formatNumber(nutrition?.salt ?? null),
    });
  }

  private draftFieldLabel(field: string): string | null {
    const labels: Record<string, string> = {
      name: "articleEditor.field.name",
      brand: "articleEditor.field.brand",
      emoji: "articleEditor.field.icon",
      price: "articleEditor.field.price",
      categoryId: "articleEditor.field.category",
      supermarketId: "articleEditor.field.store",
      aisleId: "articleEditor.field.aisle",
      nutrition: "articleEditor.nutrition.heading",
    };

    const key = labels[field];

    return undefined === key ? null : this.t(key);
  }

  private loadArticle(): void {
    this.getArticleService.getArticle(this.id()).subscribe({
      next: (response) => {
        this.patchForm(response.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private patchForm(article: Article): void {
    this.articleName.set(article.attributes.name);
    this.storedImage.set(article.attributes.image ?? null);
    const nutrition = article.relationships?.nutritionFacts?.data.attributes;
    const baseUnit = article.attributes.baseUnit ?? DEFAULT_BASE_UNIT;

    this.form.patchValue({
      name: article.attributes.name,
      emoji: article.attributes.emoji ?? "",
      brand: article.attributes.brand ?? "",
      price: this.formatNumber(article.attributes.price),
      categoryId: article.relationships?.category?.data.id ?? null,
      supermarketId: article.relationships?.supermarket?.data.id ?? null,
      aisleId: article.attributes.aisleId ?? null,
      units: {
        baseUnit,
        recipeUnit: article.attributes.recipeUnit ?? baseUnit,
        diaryUnit: article.attributes.diaryUnit ?? baseUnit,
        packUnit: article.attributes.packUnit ?? null,
        equivalences: (article.attributes.equivalences ?? []).map((item) => ({
          unit: item.unit,
          quantity: item.quantity,
        })),
      },
      calories: this.formatNumber(nutrition?.calories ?? null),
      protein: this.formatNumber(nutrition?.protein ?? null),
      fat: this.formatNumber(nutrition?.fat ?? null),
      saturatedFat: this.formatNumber(nutrition?.saturatedFat ?? null),
      carbs: this.formatNumber(nutrition?.carbs ?? null),
      sugars: this.formatNumber(nutrition?.sugars ?? null),
      salt: this.formatNumber(nutrition?.salt ?? null),
    });
  }

  private buildPayload(): CreateArticleRequest {
    const value = this.form.value;

    const nutrition: ArticleNutritionRequest = {
      referenceAmount: REFERENCE_AMOUNT,
      calories: this.parseDecimal(value.calories),
      protein: this.parseDecimal(value.protein),
      carbs: this.parseDecimal(value.carbs),
      sugars: this.parseDecimal(value.sugars),
      fat: this.parseDecimal(value.fat),
      saturatedFat: this.parseDecimal(value.saturatedFat),
      fiber: null,
      salt: this.parseDecimal(value.salt),
    };

    const units = (value.units ??
      defaultUnitsValue()) as EquivalenceEditorValue;
    const equivalences = units.equivalences
      .map((line) => ({
        unit: (line.unit ?? "").trim(),
        quantity: this.parseDecimal(line.quantity),
      }))
      .filter(
        (line): line is { unit: string; quantity: number } =>
          "" !== line.unit && null !== line.quantity && line.quantity > 0,
      );

    return {
      id: this.articleId,
      name: (value.name ?? "").trim(),
      recipeUnit: units.recipeUnit,
      baseUnit: units.baseUnit,
      diaryUnit: units.diaryUnit,
      packUnit: equivalences.some((line) => line.unit === units.packUnit)
        ? units.packUnit
        : null,
      price: this.parseDecimal(value.price),
      brand: this.emptyToNull(value.brand),
      emoji: this.emptyToNull(value.emoji),
      categoryId: value.categoryId ?? null,
      supermarketId: value.supermarketId ?? null,
      aisleId: value.supermarketId ? (value.aisleId ?? null) : null,
      nutrition,
      equivalences,
    };
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  private parseDecimal(
    value: string | number | null | undefined,
  ): number | null {
    if (null === value || undefined === value || "" === value) {
      return null;
    }

    const normalized = String(value).replace(",", ".").trim();
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
  }

  private formatNumber(value: number | null): string {
    if (null === value || undefined === value) {
      return "";
    }

    return String(value).replace(".", ",");
  }

  private emptyToNull(value: string | null | undefined): string | null {
    const trimmed = (value ?? "").trim();

    return "" === trimmed ? null : trimmed;
  }
}
