import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
import { Observable } from "rxjs";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { SelectComponent } from "@shared/design-system/select/infrastructure/components/select.component";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { MetaItemComponent } from "@shared/design-system/meta-item/infrastructure/components/meta-item.component";
import { ProgressBarComponent } from "@shared/design-system/progress-bar/infrastructure/components/progress-bar.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonFiltersComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-filters.component";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { GetInventoriesService } from "@nutrition/pantry/inventory/application/services/get-inventories.service";
import { InventoryViewService } from "@nutrition/pantry/inventory/application/services/inventory-view.service";
import { Inventory } from "../../domain/models/inventory.model";
import { InventoryRow } from "../../domain/models/inventory-row.model";
import { InventoryShift } from "../../domain/models/inventory-shift.model";
import { InventoryStatus } from "../../domain/models/inventory-status.model";

@Component({
  selector: "app-get-inventories",
  templateUrl: "./get-inventories.component.html",
  imports: [
    NgTemplateOutlet,
    FormsModule,
    RevealDirective,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    GridComponent,
    CardComponent,
    HeadingComponent,
    TextComponent,
    ChipComponent,
    ButtonComponent,
    SelectComponent,
    MetaItemComponent,
    ProgressBarComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    SkeletonFiltersComponent,
    InfiniteScrollComponent,
  ],
})
export class GetInventoriesComponent extends AbstractListPageComponent<Inventory> {
  private static readonly PAGE_SIZE = 20;

  private getInventoriesService = inject(GetInventoriesService);
  private inventoryView = inject(InventoryViewService);

  protected readonly modulePath = "nutrition/pantry/inventory";
  protected readonly storageKey = "pageSize_inventories";
  protected override readonly appendsPages = true;

  selectedShift = signal("");
  selectedStatus = signal("");

  reloading = signal(false);
  loadingMore = signal(false);

  shiftOptions = computed<SelectOption[]>(() => [
    {
      value: InventoryShift.MORNING,
      label: this.t(this.inventoryView.shiftKey(InventoryShift.MORNING)),
    },
    {
      value: InventoryShift.AFTERNOON,
      label: this.t(this.inventoryView.shiftKey(InventoryShift.AFTERNOON)),
    },
    {
      value: InventoryShift.NIGHT,
      label: this.t(this.inventoryView.shiftKey(InventoryShift.NIGHT)),
    },
  ]);

  statusOptions = computed<SelectOption[]>(() => [
    {
      value: InventoryStatus.DRAFT,
      label: this.t(this.inventoryView.statusKey(InventoryStatus.DRAFT)),
    },
    {
      value: InventoryStatus.VALIDATED,
      label: this.t(this.inventoryView.statusKey(InventoryStatus.VALIDATED)),
    },
  ]);

  hasMore = computed(() => this.items().length < this.totalItems());

  headerSubtitle = computed(
    () => `${this.totalItems()} ${this.t("getInventories.stats.counts")}`,
  );

  rows = computed<InventoryRow[]>(() =>
    this.items().map((inventory) => this.toRow(inventory)),
  );

  protected configureList(): void {
    this.currentPage.set(1);
    this.pageSize.set(GetInventoriesComponent.PAGE_SIZE);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Inventory>> {
    return this.getInventoriesService.getInventories(
      page,
      pageSize,
      this.selectedShift() || undefined,
      this.selectedStatus() || undefined,
    );
  }

  protected override captureFilters(): Record<string, string> {
    return { shift: this.selectedShift(), status: this.selectedStatus() };
  }

  protected override restoreFilters(filters: Record<string, string>): void {
    this.selectedShift.set(filters["shift"] ?? "");
    this.selectedStatus.set(filters["status"] ?? "");
  }

  loadMore(): void {
    if (
      this.loading() ||
      this.loadingMore() ||
      this.reloading() ||
      !this.hasMore()
    )
      return;

    const nextPage = this.currentPage() + 1;
    this.loadingMore.set(true);

    this.fetch(nextPage, this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.currentPage.set(nextPage);
          this.items.update((current) => [...current, ...response.data]);
          this.totalItems.set(response.meta.total);
          this.loadingMore.set(false);
        },
        error: () => this.loadingMore.set(false),
      });
  }

  onShiftChange(shift: string): void {
    this.selectedShift.set(shift);
    this.reload();
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.reload();
  }

  onStart(): void {
    this.router.navigate(["/inventory", "start"]);
  }

  onOpen(id: string): void {
    this.router.navigate(["/inventory", id]);
  }

  private reload(): void {
    this.currentPage.set(1);
    this.reloading.set(true);

    this.fetch(1, this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.items.set(response.data);
          this.totalItems.set(response.meta.total);
          this.reloading.set(false);
        },
        error: () => this.reloading.set(false),
      });
  }

  private toRow(inventory: Inventory): InventoryRow {
    const attributes = inventory.attributes;
    const shiftLabel = this.t(this.inventoryView.shiftKey(attributes.shift));

    return {
      id: inventory.id,
      dateLabel: this.inventoryView.dateLabel(attributes.countedOn),
      metaLabel: `${shiftLabel} · ${this.translate("getInventories.card.locations", { count: attributes.totalLocations })}`,
      statusLabel: this.t(this.inventoryView.statusKey(attributes.status)),
      validated: InventoryStatus.VALIDATED === attributes.status,
      progressPercent: this.progressPercent(
        attributes.countedItems,
        attributes.totalItems,
      ),
      countedLabel: this.translate("getInventories.card.counted", {
        counted: attributes.countedItems,
        total: attributes.totalItems,
      }),
      adjustedLabel: this.translate("getInventories.card.adjusted", {
        count: attributes.adjustedItems,
      }),
    };
  }

  private progressPercent(counted: number, total: number): number {
    if (total <= 0) return 0;

    return Math.round((counted / total) * 100);
  }

  private translate(key: string, params: Record<string, unknown>): string {
    return this.translationService.translate(key, this.modulePath, params);
  }
}
