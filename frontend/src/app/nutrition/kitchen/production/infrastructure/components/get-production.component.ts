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
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { CheckRowComponent } from "@shared/design-system/check-row/infrastructure/components/check-row.component";
import { CtaRowComponent } from "@shared/design-system/cta-row/infrastructure/components/cta-row.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonHeroComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-hero.component";
import { SkeletonChipsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-chips.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { GetProductionService } from "@nutrition/kitchen/production/application/services/get-production.service";
import { FinishProductionService } from "@nutrition/kitchen/production/application/services/finish-production.service";
import { DiscardProductionService } from "@nutrition/kitchen/production/application/services/discard-production.service";
import { ProductionViewService } from "@nutrition/kitchen/production/application/services/production-view.service";
import { ProductionDetail } from "@nutrition/kitchen/production/domain/models/production-detail.model";
import { IngredientRow } from "@nutrition/kitchen/production/domain/models/ingredient-row.model";
import { StepRow } from "@nutrition/kitchen/production/domain/models/step-row.model";

@Component({
  selector: "app-get-production",
  templateUrl: "./get-production.component.html",
  styleUrls: ["./get-production.component.css"],
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    RevealDirective,
    PageWrapperComponent,
    SplitViewComponent,
    ScreenHeaderComponent,
    StackComponent,
    HeadingComponent,
    ChipComponent,
    TextComponent,
    NumberInputComponent,
    ButtonComponent,
    EmojiTileComponent,
    SectionHeaderComponent,
    CheckRowComponent,
    CtaRowComponent,
    EmptyStateComponent,
    ConfirmActionModalComponent,
    SkeletonScreenHeaderComponent,
    SkeletonHeroComponent,
    SkeletonChipsComponent,
    SkeletonSectionHeaderComponent,
    SkeletonListComponent,
  ],
})
export class GetProductionComponent {
  private translationService = inject(TranslationService);
  private getProductionService = inject(GetProductionService);
  private finishProductionService = inject(FinishProductionService);
  private discardProductionService = inject(DiscardProductionService);
  private floatingToastService = inject(FloatingToastService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  protected view = inject(ProductionViewService);

  private readonly MODULE_PATH = "nutrition/kitchen/production";

  readonly id = input.required<string>();

  loading = signal(true);
  production = signal<ProductionDetail | null>(null);
  checkedIngredients = signal<ReadonlySet<string>>(new Set());
  checkedSteps = signal<ReadonlySet<string>>(new Set());
  servings = signal(1);
  finishing = signal(false);
  discarding = signal(false);
  showDiscardModal = signal(false);

  statusLabel = computed(() => {
    const detail = this.production();

    return detail ? this.t(`getProduction.status.${detail.status}`) : "";
  });

  servingsHint = computed(() => {
    const detail = this.production();
    if (!detail || detail.servingsCooked === this.servings()) {
      return this.t("getProduction.servingsHint");
    }

    return this.t("getProduction.servingsChanged", {
      servings: this.view.servings(detail.servingsCooked),
    });
  });

  recipeServingsLabel = computed(() => {
    const detail = this.production();
    if (!detail) return "";

    return this.t("getProduction.recipeServings", {
      servings: this.view.servings(detail.recipeServings),
    });
  });

  ingredientRows = computed<IngredientRow[]>(() => {
    const detail = this.production();
    if (!detail) return [];

    return detail.ingredients.map((ingredient) => ({
      key: ingredient.articleId,
      name: ingredient.name,
      emoji: ingredient.emoji,
      meta: this.view.quantityLabel(
        this.view.scale(
          ingredient.quantity,
          detail.servingsCooked,
          this.servings(),
        ),
        ingredient.unit,
      ),
      checked: this.checkedIngredients().has(ingredient.articleId),
    }));
  });

  stepRows = computed<StepRow[]>(() =>
    (this.production()?.steps ?? []).map((step) => ({
      key: `${step.position}`,
      eyebrow: this.t("getProduction.step", { position: step.position }),
      text: step.text,
      chip: step.minutes
        ? this.t("getProduction.minutes", { minutes: step.minutes })
        : "",
      checked: this.checkedSteps().has(`${step.position}`),
    })),
  );

  ingredientsProgress = computed(() =>
    this.view.progressLabel(
      this.ingredientRows().filter((row) => row.checked).length,
      this.ingredientRows().length,
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

    toObservable(this.id)
      .pipe(
        switchMap((id) => {
          this.loading.set(true);
          this.checkedIngredients.set(new Set());
          this.checkedSteps.set(new Set());

          return this.getProductionService
            .getProduction(id)
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        const detail = response?.data ?? null;

        this.production.set(detail);
        this.servings.set(detail?.servingsCooked ?? 1);
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
    this.checkedIngredients.set(
      this.view.toggle(this.checkedIngredients(), key),
    );
  }

  onToggleStep(key: string): void {
    this.checkedSteps.set(this.view.toggle(this.checkedSteps(), key));
  }

  onBack(): void {
    this.router.navigate(["/cocina"], {
      queryParams: { date: this.production()?.cookDate },
    });
  }

  onOpenRecipe(): void {
    const detail = this.production();
    if (!detail) return;

    this.router.navigate(["/recipes", detail.recipeId]);
  }

  onFinish(): void {
    const detail = this.production();
    if (!detail || this.finishing()) return;

    this.finishing.set(true);

    this.finishProductionService
      .finishProduction(detail.id, { servingsCooked: this.servings() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.finishing.set(false);
          this.onBack();
        },
        error: () => {
          this.finishing.set(false);
          this.showError("finishProduction.error.finish");
        },
      });
  }

  onDiscard(): void {
    this.showDiscardModal.set(true);
  }

  onCancelDiscard(): void {
    this.showDiscardModal.set(false);
  }

  onConfirmDiscard(): void {
    const detail = this.production();
    if (!detail || this.discarding()) return;

    this.discarding.set(true);

    this.discardProductionService
      .discardProduction(detail.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.discarding.set(false);
          this.showDiscardModal.set(false);
          this.router.navigate(["/cocina"], {
            queryParams: { date: detail.cookDate },
          });
        },
        error: () => {
          this.discarding.set(false);
          this.showError("finishProduction.error.discard");
        },
      });
  }

  private showError(keyTranslation: string): void {
    this.floatingToastService.showToast({
      status: 500,
      keyTranslation,
      details: [],
    });
  }
}
