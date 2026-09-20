import { Component, computed, inject, input, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import {
  ArticleDetailView,
  ArticleMacroSet,
  ArticleViewService,
} from "@nutrition/catalog/article/application/services/article-view.service";
import { GetArticleService } from "@nutrition/catalog/article/application/services/get-article.service";
import { DeleteArticleService } from "@nutrition/catalog/article/application/services/delete-article.service";
import { CorrectArticleStockService } from "@nutrition/pantry/stock/application/services/correct-article-stock.service";
import { SetArticleStockTrackingService } from "@nutrition/pantry/stock/application/services/set-article-stock-tracking.service";
import { AssignPantryLocationItemService } from "@nutrition/pantry/location/application/services/assign-pantry-location-item.service";
import { ReleasePantryLocationItemService } from "@nutrition/pantry/location/application/services/release-pantry-location-item.service";
import { PantryLocationItemKind } from "@nutrition/pantry/location/domain/models/pantry-location-item-kind.model";
import { GetPantryLocationsService } from "@nutrition/pantry/location/application/services/get-pantry-locations.service";
import { PantryLocation } from "@nutrition/pantry/location/domain/models/pantry-location.model";
import { StockViewService } from "@nutrition/pantry/stock/application/services/stock-view.service";
import { ArticleStockView } from "@nutrition/pantry/stock/domain/models/article-stock-view.model";
import { Article } from "@nutrition/catalog/article/domain/models/article.model";
import { StockUnitMode } from "@nutrition/pantry/stock/domain/models/stock-unit-mode.model";
import { StockCorrectionKind } from "@nutrition/pantry/stock/domain/models/stock-correction-kind.model";
import { StockLevel } from "@nutrition/pantry/stock/domain/models/stock-level.model";
import { StockTrackingMode } from "@nutrition/pantry/stock/domain/models/stock-tracking-mode.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { AggregateImageService } from "@shared/aggregate-image/application/services/aggregate-image.service";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonChipsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-chips.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonHeroComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-hero.component";
import { SkeletonMacroBarsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-macro-bars.component";
import { SkeletonRowsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-rows.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { ProductHeroComponent } from "@shared/design-system/product-hero/infrastructure/components/product-hero.component";
import { MacroBarsComponent } from "@shared/design-system/macro-bars/infrastructure/components/macro-bars.component";
import { NutritionFactsComponent } from "@shared/design-system/nutrition-facts/infrastructure/components/nutrition-facts.component";
import { SegmentedToggleComponent } from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import {
  SelectChipOption,
  SelectChipsComponent,
} from "@shared/design-system/select-chips/infrastructure/components/select-chips.component";
import {
  ChoiceChipOption,
  ChoiceChipsComponent,
} from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { DividerComponent } from "@shared/design-system/divider/infrastructure/components/divider.component";
import { EquivalenceSummaryComponent } from "@shared/design-system/equivalence-summary/infrastructure/components/equivalence-summary.component";
import { PurchaseSummaryComponent } from "@shared/design-system/purchase-summary/infrastructure/components/purchase-summary.component";
import { StockControlComponent } from "@shared/design-system/stock-control/infrastructure/components/stock-control.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { AmountInputComponent } from "@shared/design-system/amount-input/infrastructure/components/amount-input.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { SegmentedOption } from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";

type NutritionMode = "pack" | "per100";

const FRACTIONS = [0.25, 0.5, 0.75, 1] as const;

const FRACTION_KEYS: Record<number, string> = {
  0.25: "quarter",
  0.5: "half",
  0.75: "threeQuarters",
  1: "full",
};

const CORRECTABLE_LEVELS = [
  StockLevel.Empty,
  StockLevel.Low,
  StockLevel.Medium,
  StockLevel.High,
  StockLevel.Full,
] as const;

const LEVEL_FACTORS: Record<string, number> = {
  [StockLevel.Empty]: 0,
  [StockLevel.Low]: 0.2,
  [StockLevel.Medium]: 0.5,
  [StockLevel.High]: 0.8,
  [StockLevel.Full]: 1,
};

@Component({
  selector: "app-get-article",
  templateUrl: "./get-article.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    ScreenHeaderComponent,
    ConfirmActionModalComponent,
    SkeletonComponent,
    SkeletonChipsComponent,
    SkeletonLineComponent,
    SkeletonScreenHeaderComponent,
    SkeletonHeroComponent,
    SkeletonMacroBarsComponent,
    SkeletonRowsComponent,
    EmptyStateComponent,
    TextComponent,
    StackComponent,
    ChipComponent,
    ProductHeroComponent,
    MacroBarsComponent,
    NutritionFactsComponent,
    SegmentedToggleComponent,
    SelectChipsComponent,
    ChoiceChipsComponent,
    FieldComponent,
    DividerComponent,
    EquivalenceSummaryComponent,
    PurchaseSummaryComponent,
    StockControlComponent,
    ModalSheetComponent,
    AmountInputComponent,
    ButtonComponent,
  ],
})
export class GetArticleComponent {
  private router = inject(Router);
  private backNavigation = inject(BackNavigationService);
  private getArticleService = inject(GetArticleService);
  private deleteArticleService = inject(DeleteArticleService);
  private correctArticleStockService = inject(CorrectArticleStockService);
  private setArticleStockTrackingService = inject(
    SetArticleStockTrackingService,
  );
  private assignItemService = inject(AssignPantryLocationItemService);
  private releaseItemService = inject(ReleasePantryLocationItemService);
  private getPantryLocationsService = inject(GetPantryLocationsService);
  private translationService = inject(TranslationService);
  private stockView = inject(StockViewService);
  protected view = inject(ArticleViewService);
  private aggregateImageService = inject(AggregateImageService);
  private entityVisual = inject(EntityVisualService);

  loading = signal(true);
  notFound = signal(false);
  article = signal<Article | null>(null);
  detail = signal<ArticleDetailView | null>(null);

  imageUrl = computed(() => {
    const article = this.article();

    if (null === article) return null;

    return this.entityVisual.urlOf(
      VisualSurface.Catalog,
      AggregateImageKind.Article,
      article.id,
      article.attributes.image ?? null,
    );
  });
  showDeleteModal = signal(false);
  deleting = signal(false);
  mode = signal<NutritionMode>("per100");
  activeMacros = computed<ArticleMacroSet | null>(() => {
    const detail = this.detail();
    if (null === detail) return null;

    return "pack" === this.mode() ? detail.pack : detail.per100;
  });
  readonly id = input.required<string>();

  stock = signal<ArticleStockView | null>(null);
  savingStock = signal(false);
  savingTracking = signal(false);
  showStockEditor = signal(false);
  correctionKind = signal<StockCorrectionKind>(StockCorrectionKind.Measured);
  correctionFraction = signal<number | null>(null);
  correctionLevel = signal<StockLevel | null>(null);
  trackingMode = signal<StockTrackingMode>(StockTrackingMode.Approximate);
  locations = signal<PantryLocation[]>([]);
  stockLocationId = signal<string>("");
  movingStock = signal(false);
  locationOptions = computed<SelectChipOption[]>(() => [
    {
      value: "",
      label: this.translationService.translate(
        "getArticle.stock.editor.noLocation",
        "nutrition/catalog/article",
      ),
    },
    ...this.locations().map((location) => ({
      value: location.id,
      label: `${location.attributes.emoji} ${location.attributes.name}`.trim(),
    })),
  ]);
  stockDraft = signal("");
  stockDraftMode = signal<StockUnitMode>(StockUnitMode.Pack);
  stockModeOptions = computed<SegmentedOption[]>(() => {
    const stock = this.stock();
    if (null === stock) return [];

    const base = { value: StockUnitMode.Base, label: stock.baseUnit };

    if (!stock.hasPack) return [base];

    return [
      { value: StockUnitMode.Pack, label: this.stockView.packLabel(stock) },
      base,
    ];
  });
  stockModeUnitLabel = computed<string>(() => {
    const stock = this.stock();
    if (null === stock) return "";

    return StockUnitMode.Pack === this.stockDraftMode()
      ? this.stockView.packLabel(stock)
      : stock.baseUnit;
  });
  stockDraftBase = computed<number | null>(() => {
    const stock = this.stock();
    if (null === stock) return null;

    const parsed = Number(this.stockDraft().replace(",", ".").trim());
    if (!Number.isFinite(parsed) || parsed < 0) return null;

    return StockUnitMode.Pack === this.stockDraftMode()
      ? parsed * stock.packSize
      : parsed;
  });
  hasReference = computed<boolean>(() => {
    const stock = this.stock();

    return null !== stock && null !== stock.referenceQuantity;
  });
  correctionKindOptions = computed<SegmentedOption[]>(() => {
    const measured: SegmentedOption = {
      value: StockCorrectionKind.Measured,
      label: this.t("getArticle.stock.editor.kind.measured"),
    };

    if (!this.hasReference()) return [measured];

    return [
      measured,
      {
        value: StockCorrectionKind.Fraction,
        label: this.t("getArticle.stock.editor.kind.fraction"),
      },
      {
        value: StockCorrectionKind.Level,
        label: this.t("getArticle.stock.editor.kind.level"),
      },
    ];
  });
  fractionOptions = computed<ChoiceChipOption[]>(() =>
    FRACTIONS.map((fraction) => ({
      value: fraction,
      label: this.t(
        `getArticle.stock.editor.fraction.${FRACTION_KEYS[fraction]}`,
      ),
    })),
  );
  levelOptions = computed<ChoiceChipOption[]>(() =>
    CORRECTABLE_LEVELS.map((level) => ({
      value: level,
      label: this.t(`getArticle.stock.level.${level}`),
    })),
  );
  trackingOptions = computed<SegmentedOption[]>(() =>
    Object.values(StockTrackingMode).map((mode) => ({
      value: mode,
      label: this.t(`getArticle.stock.tracking.${mode}`),
    })),
  );
  trackingHint = computed<string>(() =>
    this.t(`getArticle.stock.tracking.hint.${this.trackingMode()}`),
  );
  stockLevelLabel = computed<string>(() => {
    const stock = this.stock();

    if (null === stock || !stock.tracked) return "";

    return this.t(`getArticle.stock.level.${stock.level}`);
  });
  stockConfidenceLabel = computed<string>(() =>
    this.t("getArticle.stock.confidence"),
  );
  stockConfidencePercent = computed<number | null>(() => {
    const stock = this.stock();

    if (null === stock || !stock.estimated) return null;

    return stock.confidencePercent;
  });
  correctionPreview = computed<string | null>(() => {
    const stock = this.stock();
    const reference = stock?.referenceQuantity ?? null;
    const factor = this.correctionFactor();

    if (null === stock || null === reference || null === factor) return null;

    return this.stockView.amountText(stock, reference * factor);
  });
  canConfirmCorrection = computed<boolean>(() => {
    if (StockCorrectionKind.Measured === this.correctionKind()) {
      return null !== this.stockDraftBase();
    }

    return null !== this.correctionFactor();
  });
  stockDraftPreview = computed<string | null>(() => {
    const stock = this.stock();
    const base = this.stockDraftBase();
    if (null === stock || null === base) return null;

    return StockUnitMode.Pack === this.stockDraftMode()
      ? this.stockView.amountText(stock, base)
      : this.stockView.packsTextOf(stock, base);
  });

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((id) => {
          this.loading.set(true);
          this.notFound.set(false);
          return this.getArticleService
            .getArticle(id)
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        this.applyArticle(response?.data ?? null);
        this.notFound.set(null === response);
        this.loading.set(false);
      });
  }

  goBack(): void {
    this.backNavigation.back(["/catalog"]);
  }

  setMode(value: string): void {
    this.mode.set(value as NutritionMode);
  }

  onEdit(): void {
    this.router.navigate(["/catalog", this.id(), "edit"]);
  }

  onIncrementStock(): void {
    this.shiftStockByPacks(1);
  }

  onDecrementStock(): void {
    this.shiftStockByPacks(-1);
  }

  onClearStock(): void {
    if (this.savingStock()) return;

    this.runCorrection(
      this.correctArticleStockService.level(this.id(), StockLevel.Empty),
    );
  }

  onOpenStockEditor(): void {
    const stock = this.stock();
    if (null === stock) return;

    this.correctionKind.set(StockCorrectionKind.Measured);
    this.correctionFraction.set(null);
    this.correctionLevel.set(null);
    this.trackingMode.set(stock.trackingMode);
    this.stockDraftMode.set(
      stock.hasPack ? StockUnitMode.Pack : StockUnitMode.Base,
    );
    this.stockDraft.set(
      this.draftText(stock.hasPack ? stock.packs : stock.stock),
    );
    this.showStockEditor.set(true);
    this.loadLocations();
  }

  onCorrectionKindChange(value: string): void {
    this.correctionKind.set(value as StockCorrectionKind);
  }

  onCorrectionFractionChange(value: string | number): void {
    this.correctionFraction.set(Number(value));
  }

  onCorrectionLevelChange(value: string | number): void {
    this.correctionLevel.set(String(value) as StockLevel);
  }

  onTrackingModeChange(value: string): void {
    const mode = value as StockTrackingMode;

    if (mode === this.trackingMode() || this.savingTracking()) return;

    const previous = this.trackingMode();
    this.trackingMode.set(mode);
    this.savingTracking.set(true);

    this.setArticleStockTrackingService
      .setArticleStockTracking(this.id(), mode)
      .subscribe({
        next: () => {
          this.savingTracking.set(false);
          this.reloadArticle();
        },
        error: () => {
          this.trackingMode.set(previous);
          this.savingTracking.set(false);
        },
      });
  }

  onStockLocationChange(locationId: string): void {
    if (this.movingStock()) return;

    const previous = this.stockLocationId();

    if (locationId === previous) return;

    this.stockLocationId.set(locationId);
    this.movingStock.set(true);

    const placed =
      "" === locationId
        ? this.releaseItemService.releasePantryLocationItem(
            previous,
            PantryLocationItemKind.ARTICLE,
            this.id(),
          )
        : this.assignItemService.assignPantryLocationItem(locationId, {
            kind: PantryLocationItemKind.ARTICLE,
            refId: this.id(),
          });

    placed.subscribe({
      next: () => this.movingStock.set(false),
      error: () => {
        this.stockLocationId.set(previous);
        this.movingStock.set(false);
      },
    });
  }

  onCloseStockEditor(): void {
    this.showStockEditor.set(false);
  }

  onStockDraftChange(value: string): void {
    this.stockDraft.set(value);
  }

  onStockDraftModeChange(mode: string): void {
    const stock = this.stock();
    const base = this.stockDraftBase();
    if (null === stock) return;

    const nextMode = mode as StockUnitMode;
    this.stockDraftMode.set(nextMode);

    if (null === base) return;

    this.stockDraft.set(
      this.draftText(
        StockUnitMode.Pack === nextMode && stock.packSize > 0
          ? base / stock.packSize
          : base,
      ),
    );
  }

  onConfirmStockEditor(): void {
    if (this.savingStock()) return;

    const correction = this.buildCorrection();
    if (null === correction) return;

    this.runCorrection(correction);
  }

  onDelete(): void {
    this.showDeleteModal.set(true);
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  onConfirmDelete(): void {
    this.deleting.set(true);

    this.deleteArticleService.deleteArticle(this.id()).subscribe({
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

  private applyArticle(article: Article | null): void {
    const detail = article ? this.view.toDetail(article) : null;

    this.article.set(article);
    this.detail.set(detail);
    this.stockLocationId.set(detail?.stockLocationId ?? "");
    this.stock.set(
      null === detail
        ? null
        : this.stockView.build(detail.stockContext, detail.stockEstimate),
    );
    this.trackingMode.set(
      detail?.stockEstimate.trackingMode ?? StockTrackingMode.Approximate,
    );
  }

  private correctionFactor(): number | null {
    if (StockCorrectionKind.Fraction === this.correctionKind()) {
      return this.correctionFraction();
    }

    const level = this.correctionLevel();

    return null === level ? null : LEVEL_FACTORS[level];
  }

  private buildCorrection(): Observable<void> | null {
    const kind = this.correctionKind();

    if (StockCorrectionKind.Measured === kind) {
      const base = this.stockDraftBase();

      return null === base
        ? null
        : this.correctArticleStockService.measured(this.id(), base);
    }

    if (StockCorrectionKind.Fraction === kind) {
      const fraction = this.correctionFraction();

      return null === fraction
        ? null
        : this.correctArticleStockService.fraction(this.id(), fraction);
    }

    const level = this.correctionLevel();

    return null === level
      ? null
      : this.correctArticleStockService.level(this.id(), level);
  }

  private shiftStockByPacks(packs: number): void {
    const stock = this.stock();
    if (null === stock || this.savingStock()) return;

    const change = packs * stock.packSize;
    const bounded = Math.max(change, -stock.stock);

    this.runCorrection(
      this.correctArticleStockService.delta(this.id(), bounded),
    );
  }

  private runCorrection(correction: Observable<void>): void {
    this.savingStock.set(true);

    correction.subscribe({
      next: () => {
        this.showStockEditor.set(false);
        this.reloadArticle();
      },
      error: () => this.savingStock.set(false),
    });
  }

  private reloadArticle(): void {
    this.getArticleService
      .getArticle(this.id())
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        this.applyArticle(response?.data ?? null);
        this.savingStock.set(false);
      });
  }

  private t(key: string): string {
    return this.translationService.translate(key, "nutrition/catalog/article");
  }

  private loadLocations(): void {
    if (this.locations().length > 0) return;

    this.getPantryLocationsService.getPantryLocations(1, 100).subscribe({
      next: (response) => this.locations.set(response.data),
    });
  }

  private draftText(value: number): string {
    return String(Math.round(value * 100) / 100);
  }
}
