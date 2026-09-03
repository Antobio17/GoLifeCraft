import { Component, computed, inject, input, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import {
  ArticleDetailView,
  ArticleMacroSet,
  ArticleViewService,
} from "@nutrition/catalog/article/application/services/article-view.service";
import { GetArticleService } from "@nutrition/catalog/article/application/services/get-article.service";
import { DeleteArticleService } from "@nutrition/catalog/article/application/services/delete-article.service";
import { UpdateArticleStockService } from "@nutrition/pantry/stock/application/services/update-article-stock.service";
import { StockViewService } from "@nutrition/pantry/stock/application/services/stock-view.service";
import { ArticleStockView } from "@nutrition/pantry/stock/domain/models/article-stock-view.model";
import { Article } from "@nutrition/catalog/article/domain/models/article.model";
import { StockUnitMode } from "@nutrition/pantry/stock/domain/models/stock-unit-mode.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { AggregateImageService } from "@shared/aggregate-image/application/services/aggregate-image.service";
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
import { EquivalenceSummaryComponent } from "@shared/design-system/equivalence-summary/infrastructure/components/equivalence-summary.component";
import { PurchaseSummaryComponent } from "@shared/design-system/purchase-summary/infrastructure/components/purchase-summary.component";
import { StockControlComponent } from "@shared/design-system/stock-control/infrastructure/components/stock-control.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { AmountInputComponent } from "@shared/design-system/amount-input/infrastructure/components/amount-input.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { SegmentedOption } from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";

type NutritionMode = "pack" | "per100";

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
  private getArticleService = inject(GetArticleService);
  private deleteArticleService = inject(DeleteArticleService);
  private updateArticleStockService = inject(UpdateArticleStockService);
  private stockView = inject(StockViewService);
  protected view = inject(ArticleViewService);
  private aggregateImageService = inject(AggregateImageService);

  loading = signal(true);
  notFound = signal(false);
  article = signal<Article | null>(null);
  detail = signal<ArticleDetailView | null>(null);

  imageUrl = computed(() => {
    const article = this.article();

    if (null === article) return null;

    return this.aggregateImageService.objectUrl(
      AggregateImageKind.Article,
      article.id,
      article.attributes.image ?? null,
    )();
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
  showStockEditor = signal(false);
  stockDraft = signal("");
  stockDraftMode = signal<StockUnitMode>(StockUnitMode.Pack);
  stockModeOptions = computed<SegmentedOption[]>(() => {
    const stock = this.stock();
    if (null === stock) return [];

    return [
      { value: StockUnitMode.Pack, label: this.stockView.packLabel(stock) },
      { value: StockUnitMode.Base, label: stock.baseUnit },
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
  stockDraftPreview = computed<string | null>(() => {
    const stock = this.stock();
    const base = this.stockDraftBase();
    if (null === stock || null === base) return null;

    const preview = this.stockView.build(stock, base);

    return StockUnitMode.Pack === this.stockDraftMode()
      ? preview.baseText
      : preview.packsText;
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
        const detail = response ? this.view.toDetail(response.data) : null;
        this.article.set(response?.data ?? null);
        this.detail.set(detail);
        this.stock.set(
          null === detail
            ? null
            : this.stockView.build(detail.stockContext, detail.stock),
        );
        this.notFound.set(null === response);
        this.loading.set(false);
      });
  }

  goBack(): void {
    this.router.navigate(["/catalog"]);
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
    this.saveStock(0);
  }

  onOpenStockEditor(): void {
    const stock = this.stock();
    if (null === stock) return;

    this.stockDraftMode.set(StockUnitMode.Pack);
    this.stockDraft.set(this.draftText(stock.packs));
    this.showStockEditor.set(true);
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
    const base = this.stockDraftBase();
    if (null === base) return;

    this.saveStock(base);
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

  private shiftStockByPacks(packs: number): void {
    const stock = this.stock();
    if (null === stock) return;

    this.saveStock(Math.max(0, stock.stock + packs * stock.packSize));
  }

  private saveStock(value: number): void {
    const stock = this.stock();
    if (null === stock || this.savingStock()) return;

    this.savingStock.set(true);

    this.updateArticleStockService
      .updateArticleStock(this.id(), value)
      .subscribe({
        next: () => {
          this.stock.set(this.stockView.build(stock, value));
          this.savingStock.set(false);
          this.showStockEditor.set(false);
        },
        error: () => this.savingStock.set(false),
      });
  }

  private draftText(value: number): string {
    return String(Math.round(value * 100) / 100);
  }
}
