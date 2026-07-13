import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { forkJoin } from "rxjs";
import { delay, tap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { EmojiPickerComponent } from "@shared/design-system/emoji-picker/infrastructure/components/emoji-picker.component";
import { SelectChipsComponent } from "@shared/design-system/select-chips/infrastructure/components/select-chips.component";
import { PriceInputComponent } from "@shared/design-system/price-input/infrastructure/components/price-input.component";
import { NutrientInputComponent } from "@shared/design-system/nutrient-input/infrastructure/components/nutrient-input.component";
import { NutritionEditorComponent } from "@shared/design-system/nutrition-editor/infrastructure/components/nutrition-editor.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { GetCategoriesService } from "@nutrition/catalog/category/application/services/get-categories.service";
import { GetSupermarketsService } from "@nutrition/catalog/supermarket/application/services/get-supermarkets.service";
import { EmojiCatalogService } from "../../application/services/emoji-catalog.service";
import { CreateArticleService } from "../../application/services/create-article.service";
import { UpdateArticleService } from "../../application/services/update-article.service";
import { DeleteArticleService } from "../../application/services/delete-article.service";
import { GetArticleService } from "../../application/services/get-article.service";
import { Article } from "../../domain/models/article.model";
import {
  ArticleNutritionRequest,
  CreateArticleRequest,
} from "../../domain/models/create-article.model";

const FALLBACK_EMOJI = "🍽️";
const REFERENCE_AMOUNT = 100;

@Component({
  selector: "app-article-editor",
  templateUrl: "./article-editor.component.html",
  styleUrl: "./article-editor.component.scss",
  imports: [
    ReactiveFormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    FieldComponent,
    TextInputComponent,
    EmojiPickerComponent,
    SelectChipsComponent,
    PriceInputComponent,
    NutrientInputComponent,
    NutritionEditorComponent,
    ButtonComponent,
    ConfirmActionModalComponent,
    StackComponent,
    SkeletonComponent,
  ],
})
export class ArticleEditorComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private createArticleService = inject(CreateArticleService);
  private updateArticleService = inject(UpdateArticleService);
  private deleteArticleService = inject(DeleteArticleService);
  private getArticleService = inject(GetArticleService);
  private getCategoriesService = inject(GetCategoriesService);
  private getSupermarketsService = inject(GetSupermarketsService);
  private emojiCatalog = inject(EmojiCatalogService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly MODULE_PATH = "nutrition/catalog/article";
  readonly emojiGroups = this.emojiCatalog.groups();
  readonly fallbackEmoji = FALLBACK_EMOJI;

  categoryOptions = signal<{ value: string; label: string }[]>([]);
  supermarketOptions = signal<{ value: string; label: string }[]>([]);

  form: FormGroup;
  loading = signal(true);
  saving = signal(false);
  showDeleteModal = signal(false);
  deleting = signal(false);
  articleName = signal("");

  private id = "";
  private recipeUnit = "gram";

  constructor() {
    this.form = this.formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      emoji: [""],
      brand: [""],
      price: [""],
      categoryId: [null as string | null],
      supermarketId: [null as string | null],
      calories: [""],
      protein: [""],
      fat: [""],
      saturatedFat: [""],
      carbs: [""],
      sugars: [""],
      salt: [""],
    });
  }

  get isEdit(): boolean {
    return "" !== this.id;
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
    this.id = this.route.snapshot.paramMap.get("id") ?? "";

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
            this.supermarketOptions.set(
              supermarkets.data.map((item) => ({
                value: item.id,
                label: item.attributes.name,
              })),
            );

            if (!this.isEdit) {
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
      return;
    }

    this.saving.set(true);

    const payload = this.buildPayload();
    const request$ = this.isEdit
      ? this.updateArticleService.updateArticle(this.id, payload)
      : this.createArticleService.createArticle(payload);

    request$
      .pipe(
        tap(() => {
          this.saving.set(false);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: this.isEdit
              ? "article.update.success"
              : "article.create.success",
            details: [],
          });
        }),
        delay(900),
      )
      .subscribe({
        next: () => this.router.navigate(["/catalog"]),
        error: () => this.saving.set(false),
      });
  }

  cancel(): void {
    this.router.navigate(this.isEdit ? ["/catalog", this.id] : ["/catalog"]);
  }

  onDelete(): void {
    this.showDeleteModal.set(true);
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  onConfirmDelete(): void {
    this.deleting.set(true);

    this.deleteArticleService
      .deleteArticle(this.id)
      .pipe(
        tap(() => {
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "article.delete.success",
            details: [],
          });
        }),
        delay(600),
      )
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.showDeleteModal.set(false);
          this.router.navigate(["/catalog"]);
        },
        error: () => {
          this.deleting.set(false);
          this.showDeleteModal.set(false);
        },
      });
  }

  private loadArticle(): void {
    this.getArticleService.getArticle(this.id).subscribe({
      next: (response) => {
        this.patchForm(response.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private patchForm(article: Article): void {
    this.recipeUnit = article.attributes.recipeUnit ?? "gram";
    this.articleName.set(article.attributes.name);
    const nutrition = article.relationships?.nutritionFacts?.data.attributes;

    this.form.patchValue({
      name: article.attributes.name,
      emoji: article.attributes.emoji ?? "",
      brand: article.attributes.brand ?? "",
      price: this.formatNumber(article.attributes.price),
      categoryId: article.relationships?.category?.data.id ?? null,
      supermarketId: article.relationships?.supermarket?.data.id ?? null,
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

    return {
      name: (value.name ?? "").trim(),
      recipeUnit: this.recipeUnit,
      price: this.parseDecimal(value.price),
      brand: this.emptyToNull(value.brand),
      emoji: this.emptyToNull(value.emoji),
      categoryId: value.categoryId ?? null,
      supermarketId: value.supermarketId ?? null,
      nutrition,
    };
  }

  private t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
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
