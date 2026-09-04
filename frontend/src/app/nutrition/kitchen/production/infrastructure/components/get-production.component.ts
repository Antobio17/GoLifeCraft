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
import { ProductionRowComponent } from "@shared/design-system/production-row/infrastructure/components/production-row.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { GetProductionService } from "@nutrition/kitchen/production/application/services/get-production.service";
import { DiscardProductionService } from "@nutrition/kitchen/production/application/services/discard-production.service";
import { ProductionRangeService } from "@nutrition/kitchen/production/application/services/production-range.service";
import { ProductionRowState } from "@shared/design-system/production-row/domain/models/production-row-state.model";
import { ProductionViewService } from "@nutrition/kitchen/production/application/services/production-view.service";
import { ProductionDetailAttributes } from "@nutrition/kitchen/production/domain/models/production-detail-attributes.model";
import { ProductionItemStatus } from "@nutrition/kitchen/production/domain/models/production-item-status.model";
import { ProductionItemView } from "@nutrition/kitchen/production/domain/models/production-item-view.model";
import { ProductionRecipeRow } from "@nutrition/kitchen/production/domain/models/production-recipe-row.model";
import { ProductionStatus } from "@nutrition/kitchen/production/domain/models/production-status.model";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";

@Component({
  selector: "app-get-production",
  templateUrl: "./get-production.component.html",
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
    ProductionRowComponent,
    EmptyStateComponent,
    ConfirmActionModalComponent,
    SkeletonScreenHeaderComponent,
    SkeletonListComponent,
  ],
})
export class GetProductionComponent {
  private translationService = inject(TranslationService);
  private entityVisual = inject(EntityVisualService);
  private getProductionService = inject(GetProductionService);
  private discardProductionService = inject(DiscardProductionService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  protected range = inject(ProductionRangeService);
  protected view = inject(ProductionViewService);

  private readonly MODULE_PATH = "nutrition/kitchen/production";

  protected readonly ProductionRowState = ProductionRowState;

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

      return {
        item,
        imageUrl: this.entityVisual.urlOf(
          VisualSurface.Kitchen,
          AggregateImageKind.Recipe,
          item.recipeId,
          item.image,
        ),
        meta: this.rowMeta(item, done),
        done,
        origin: item.requiredBy.length
          ? this.t("getProduction.row.requiredBy", {
              parents: this.view.joinNames(item.requiredBy),
            })
          : this.t("getProduction.row.fromDiary"),
      };
    }),
  );

  pendingCount = computed(() => this.rows().filter((row) => !row.done).length);

  private rowMeta(item: ProductionItemView, done: boolean): string {
    const servings = done
      ? this.t("getProduction.row.cooked", {
          servings: this.view.servings(item.servingsCooked),
        })
      : this.t("getProduction.row.planned", {
          servings: this.view.servings(item.servingsPlanned),
        });

    const marks = [
      item.code ?? "",
      item.customized ? this.t("getProduction.row.changed") : "",
    ].filter((mark) => "" !== mark);

    return 0 === marks.length ? servings : `${servings} · ${marks.join(" · ")}`;
  }

  summary = computed(() => {
    const detail = this.production();
    if (!detail) return "";

    return this.t("getProduction.summary", {
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
    this.router.navigate(["/cocina"]);
  }

  onOpen(item: ProductionItemView): void {
    this.router.navigate(["/cocina", this.id(), item.itemId]);
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
