import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { ModuleCardComponent } from "@shared/design-system/module-card/infrastructure/components/module-card.component";
import { BigFigureComponent } from "@shared/design-system/big-figure/infrastructure/components/big-figure.component";
import { BarChartComponent } from "@shared/design-system/bar-chart/infrastructure/components/bar-chart.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { PressableComponent } from "@shared/design-system/pressable/infrastructure/components/pressable.component";
import { RailComponent } from "@shared/design-system/rail/infrastructure/components/rail.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonHeroComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-hero.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { GetProductionService } from "@nutrition/kitchen/production/application/services/get-production.service";
import { DiscardProductionService } from "@nutrition/kitchen/production/application/services/discard-production.service";
import { ProductionRangeService } from "@nutrition/kitchen/production/application/services/production-range.service";
import { ProductionViewService } from "@nutrition/kitchen/production/application/services/production-view.service";
import { ProposalTimelineService } from "@nutrition/kitchen/production/application/services/proposal-timeline.service";
import { ProductionDayGroup } from "@nutrition/kitchen/production/domain/models/production-day-group.model";
import { ProductionDetailAttributes } from "@nutrition/kitchen/production/domain/models/production-detail-attributes.model";
import { ProductionItemStatus } from "@nutrition/kitchen/production/domain/models/production-item-status.model";
import { ProductionItemView } from "@nutrition/kitchen/production/domain/models/production-item-view.model";
import { ProductionRecipeRow } from "@nutrition/kitchen/production/domain/models/production-recipe-row.model";
import { ProductionStatus } from "@nutrition/kitchen/production/domain/models/production-status.model";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";
import { RecipePrepMode } from "@nutrition/recipe/recipe/domain/models/recipe-prep-mode.enum";

@Component({
  selector: "app-get-production",
  templateUrl: "./get-production.component.html",
  styleUrls: ["./get-production.component.css"],
  imports: [
    ContextualTranslatePipe,
    RevealDirective,
    PageWrapperComponent,
    SplitViewComponent,
    ScreenHeaderComponent,
    StackComponent,
    TextComponent,
    ButtonComponent,
    ChipComponent,
    SectionHeaderComponent,
    ModuleCardComponent,
    BigFigureComponent,
    BarChartComponent,
    IconComponent,
    PressableComponent,
    RailComponent,
    EmojiTileComponent,
    EmptyStateComponent,
    ConfirmActionModalComponent,
    SkeletonScreenHeaderComponent,
    SkeletonListComponent,
    SkeletonHeroComponent,
    SkeletonSectionHeaderComponent,
  ],
})
export class GetProductionComponent {
  private translationService = inject(TranslationService);
  private backNavigation = inject(BackNavigationService);
  private entityVisual = inject(EntityVisualService);
  private getProductionService = inject(GetProductionService);
  private discardProductionService = inject(DiscardProductionService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  protected range = inject(ProductionRangeService);
  protected view = inject(ProductionViewService);
  private timeline = inject(ProposalTimelineService);

  private readonly MODULE_PATH = "nutrition/kitchen/production";

  readonly id = input.required<string>();

  loading = signal(true);
  production = signal<ProductionDetailAttributes | null>(null);
  discarding = signal(false);
  showDiscardModal = signal(false);

  cooking = computed(
    () => ProductionStatus.Cooking === this.production()?.status,
  );

  rangeLabel = computed(() => {
    const detail = this.production();

    return detail ? this.range.rangeLabel(detail.fromDate, detail.toDate) : "";
  });

  statusLabel = computed(() =>
    this.t(
      this.cooking()
        ? "getProduction.status.cooking"
        : "getProduction.status.done",
    ),
  );

  rows = computed<ProductionRecipeRow[]>(() =>
    (this.production()?.items ?? []).map((item) => {
      const done = ProductionItemStatus.Done === item.status;
      const servings = done ? item.servingsCooked : item.servingsPlanned;

      return {
        item,
        imageUrl: this.entityVisual.urlOf(
          VisualSurface.Kitchen,
          AggregateImageKind.Recipe,
          item.recipeId,
          item.image,
        ),
        meta: this.rowMeta(item),
        done,
        amount: this.t("getProduction.group.total", {
          servings: this.view.servings(servings),
        }),
        ariaLabel: this.t(
          done ? "getProduction.row.ariaDone" : "getProduction.row.aria",
          { name: item.name, servings: this.view.servings(servings) },
        ),
        servings,
      };
    }),
  );

  groups = computed<ProductionDayGroup[]>(() => {
    const rows = this.rows();

    return [
      this.group(
        "batch",
        this.t("getProduction.group.now"),
        this.t("getProduction.group.nowCaption"),
        rows.filter((row) => !row.item.dueDate),
      ),
      ...this.timeline
        .dueDays(rows.map((row) => row.item.dueDate))
        .map((day) => {
          const dayRows = rows.filter((row) => row.item.dueDate === day);

          return this.group(
            day,
            this.dayTitle(day),
            this.dueCaption(dayRows),
            dayRows,
          );
        }),
    ].filter((group) => group.rows.length > 0);
  });

  pendingCount = computed(() => this.rows().filter((row) => !row.done).length);

  heroServings = computed(() => {
    const detail = this.production();
    if (!detail) return "";

    return this.view.servings(
      this.cooking() ? detail.servingsPlanned : detail.servingsCooked,
    );
  });

  heroKicker = computed(() =>
    this.cooking()
      ? this.t("getProduction.pending", { pending: this.pendingCount() })
      : this.statusLabel(),
  );

  bars = computed(() => {
    const detail = this.production();
    if (!detail) return [];

    return this.timeline.barsOf(
      this.rows().map((row) => ({
        dueDate: row.item.dueDate,
        servings: row.servings,
      })),
      detail.fromDate,
      detail.toDate,
      this.range.todayIso(),
    );
  });

  private group(
    key: string,
    title: string,
    caption: string,
    rows: ProductionRecipeRow[],
  ): ProductionDayGroup {
    const servings = rows.reduce((sum, row) => sum + row.servings, 0);

    return {
      key,
      title,
      caption,
      total: this.t("getProduction.group.total", {
        servings: this.view.servings(Math.round(servings * 100) / 100),
      }),
      rows,
    };
  }

  private dayTitle(day: string): string {
    const label = this.range.dayLabel(day);

    if (day !== this.range.todayIso()) return label;

    return this.t("getProduction.group.today", { day: label });
  }

  private dueCaption(rows: ProductionRecipeRow[]): string {
    const dayBefore = rows.filter(
      (row) => RecipePrepMode.DayBefore === row.item.prepMode,
    ).length;

    if (!dayBefore) return this.t("getProduction.group.sameDayCaption");

    if (dayBefore === rows.length) {
      return this.t("getProduction.group.dayBeforeCaption");
    }

    return this.t("getProduction.group.mixedCaption");
  }

  private rowOrigin(item: ProductionItemView): string {
    if (RecipePrepMode.DayBefore === item.prepMode && item.dueDate) {
      return this.t("getProduction.row.eatenOn", {
        day: this.range.dayLabel(this.range.addDays(item.dueDate, 1)),
      });
    }

    if (item.requiredBy.length) {
      return this.t("getProduction.row.requiredBy", {
        parents: this.view.joinNames(item.requiredBy),
      });
    }

    return this.t("getProduction.row.fromDiary");
  }

  private rowMeta(item: ProductionItemView): string {
    return [
      this.rowOrigin(item),
      item.code ?? "",
      item.customized ? this.t("getProduction.row.changed") : "",
    ]
      .filter((mark) => "" !== mark)
      .join(" · ");
  }

  summary = computed(() => {
    const detail = this.production();
    if (!detail) return "";

    return this.t("getProduction.summary", {
      count: detail.items.length,
      recipes: detail.items.length,
      servings: this.view.servings(
        this.cooking() ? detail.servingsPlanned : detail.servingsCooked,
      ),
    });
  });

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);

    toObservable(this.id)
      .pipe(
        switchMap((id) => {
          this.loading.set(true);

          return this.getProductionService
            .getProduction(id)
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        this.production.set(response?.data.attributes ?? null);
        this.loading.set(false);
      });
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  onBack(): void {
    this.backNavigation.back(["/kitchen"]);
  }

  onOpen(item: ProductionItemView): void {
    this.router.navigate(["/kitchen", this.id(), item.itemId]);
  }

  onDiscard(): void {
    this.showDiscardModal.set(true);
  }

  onCancelDiscard(): void {
    this.showDiscardModal.set(false);
  }

  onConfirmDiscard(): void {
    if (this.discarding()) return;

    this.discarding.set(true);

    this.discardProductionService
      .discardProduction(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.discarding.set(false);
          this.showDiscardModal.set(false);
          this.onBack();
        },
        error: () => this.discarding.set(false),
      });
  }
}
