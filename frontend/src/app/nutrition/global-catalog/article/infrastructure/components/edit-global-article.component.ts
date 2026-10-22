import { Component, computed, inject, input, signal } from "@angular/core";
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { forkJoin, of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { GetGlobalArticleService } from "@nutrition/global-catalog/article/application/services/get-global-article.service";
import { GetGlobalArticleFacetsService } from "@nutrition/global-catalog/article/application/services/get-global-article-facets.service";
import { UpdateGlobalArticleService } from "@nutrition/global-catalog/article/application/services/update-global-article.service";
import { GlobalArticleFormService } from "@nutrition/global-catalog/article/application/services/global-article-form.service";
import { GlobalArticleViewService } from "@nutrition/global-catalog/article/application/services/global-article-view.service";
import { GlobalArticleDetailAttributes } from "@nutrition/global-catalog/article/domain/models/global-article-detail-attributes.model";
import { GlobalArticleFormValue } from "@nutrition/global-catalog/article/domain/models/global-article-form-value.model";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { EditorDraft } from "@shared/editor-form/application/editor-draft";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { PriceInputComponent } from "@shared/design-system/price-input/infrastructure/components/price-input.component";
import {
  SelectChipOption,
  SelectChipsComponent,
} from "@shared/design-system/select-chips/infrastructure/components/select-chips.component";
import { NutritionEditorComponent } from "@shared/design-system/nutrition-editor/infrastructure/components/nutrition-editor.component";
import { NutrientInputComponent } from "@shared/design-system/nutrient-input/infrastructure/components/nutrient-input.component";
import { MacroBarsComponent } from "@shared/design-system/macro-bars/infrastructure/components/macro-bars.component";
import { NutritionFactsComponent } from "@shared/design-system/nutrition-facts/infrastructure/components/nutrition-facts.component";
import { ProductHeroComponent } from "@shared/design-system/product-hero/infrastructure/components/product-hero.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonHeroComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-hero.component";
import { SkeletonRowsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-rows.component";
import { DiscardChangesModalComponent } from "@shared/design-system/discard-changes-modal/infrastructure/components/discard-changes-modal.component";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";

@Component({
  selector: "app-edit-global-article",
  templateUrl: "./edit-global-article.component.html",
  imports: [
    ReactiveFormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    SplitViewComponent,
    ButtonComponent,
    NoteComponent,
    CardComponent,
    SectionHeaderComponent,
    FieldComponent,
    TextInputComponent,
    PriceInputComponent,
    SelectChipsComponent,
    NutritionEditorComponent,
    NutrientInputComponent,
    MacroBarsComponent,
    NutritionFactsComponent,
    ProductHeroComponent,
    StackComponent,
    EmptyStateComponent,
    SkeletonScreenHeaderComponent,
    SkeletonHeroComponent,
    SkeletonRowsComponent,
    DiscardChangesModalComponent,
  ],
})
export class EditGlobalArticleComponent {
  private readonly modulePath = "nutrition/global-catalog/article";

  private getGlobalArticleService = inject(GetGlobalArticleService);
  private getGlobalArticleFacetsService = inject(GetGlobalArticleFacetsService);
  private updateGlobalArticleService = inject(UpdateGlobalArticleService);
  private formService = inject(GlobalArticleFormService);
  private view = inject(GlobalArticleViewService);
  private floatingToastService = inject(FloatingToastService);
  private translationService = inject(TranslationService);
  private backNavigation = inject(BackNavigationService);
  private formBuilder = inject(FormBuilder);

  readonly id = input.required<string>();

  loading = signal(true);
  notFound = signal(false);
  saving = signal(false);
  article = signal<GlobalArticleDetailAttributes | null>(null);
  categories = signal<string[]>([]);

  form = this.formBuilder.nonNullable.group({
    name: ["", [Validators.required]],
    brand: [""],
    categoryName: [null as string | null],
    quantity: [""],
    price: [""],
    previousPrice: [""],
    referencePrice: [""],
    referenceFormat: [""],
    calories: [""],
    protein: [""],
    fat: [""],
    saturatedFat: [""],
    carbs: [""],
    sugars: [""],
    fiber: [""],
    salt: [""],
  });

  protected readonly draft = EditorDraft.forForm(this.form);

  private formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  title = computed(
    () =>
      this.formValue().name?.trim() ||
      this.article()?.name ||
      this.t("editGlobalArticle.title"),
  );

  categoryOptions = computed<SelectChipOption[]>(() => {
    const current = this.article()?.categoryName;
    const names = new Set(this.categories());

    if (current) names.add(current);

    return [...names]
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ value: name, label: name }));
  });

  identityRows = computed(() => {
    const article = this.article();

    return [
      {
        label: this.t("editGlobalArticle.identity.barcode"),
        value: article?.barcode ?? "—",
      },
      {
        label: this.t("editGlobalArticle.identity.source"),
        value: this.view.sourceLabel(article?.source ?? null) ?? "—",
      },
    ];
  });

  preview = computed(() => {
    const split = this.formService.macroSplit(
      this.formValue() as GlobalArticleFormValue,
    );

    return {
      kcal: null === split.kcal ? "—" : this.view.count(Math.round(split.kcal)),
      protein: this.grams(split.protein),
      fat: this.grams(split.fat),
      carbs: this.grams(split.carbs),
    };
  });

  nameError = computed(() => {
    this.formValue();
    const control = this.form.controls.name;

    if (!control.touched || !control.hasError("required")) return "";

    return this.t("editGlobalArticle.field.nameRequired");
  });

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((id) => {
          this.loading.set(true);
          this.notFound.set(false);

          return forkJoin({
            response: this.getGlobalArticleService
              .getGlobalArticle(id)
              .pipe(catchError(() => of(null))),
            facets: this.getGlobalArticleFacetsService
              .getGlobalArticleFacets()
              .pipe(catchError(() => of(null))),
          });
        }),
        takeUntilDestroyed(),
      )
      .subscribe(({ response, facets }) => {
        this.categories.set(facets?.categories ?? []);
        this.loading.set(false);

        if (null === response) {
          this.notFound.set(true);
          return;
        }

        this.article.set(response.data.attributes);
        this.form.reset(this.formService.toFormValue(response.data.attributes));
        this.draft.markSaved();
      });
  }

  save(): void {
    if (this.saving()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      return;
    }

    this.saving.set(true);

    this.updateGlobalArticleService
      .updateGlobalArticle(
        this.id(),
        this.formService.toRequest(this.form.getRawValue()),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.draft.markSaved();
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "editGlobalArticle.toast.saved",
            details: [],
          });
          this.backNavigation.leave(["/global-catalog", this.id()]);
        },
        error: () => this.saving.set(false),
      });
  }

  cancel(): void {
    this.draft.leave(() =>
      this.backNavigation.leave(["/global-catalog", this.id()]),
    );
  }

  private grams(value: number | null): string {
    if (null === value) return "—";

    return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value)} g`;
  }

  private t(key: string): string {
    return this.translationService.translate(key, this.modulePath);
  }
}
