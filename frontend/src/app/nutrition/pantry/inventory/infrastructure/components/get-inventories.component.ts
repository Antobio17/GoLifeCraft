import {
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { NgTemplateOutlet } from "@angular/common";
import { Observable, filter } from "rxjs";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ModuleCardComponent } from "@shared/design-system/module-card/infrastructure/components/module-card.component";
import { ProgressRingComponent } from "@shared/design-system/progress-ring/infrastructure/components/progress-ring.component";
import { StatStripComponent } from "@shared/design-system/stat-strip/infrastructure/components/stat-strip.component";
import { ActionTileComponent } from "@shared/design-system/action-tile/infrastructure/components/action-tile.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { DatedRowComponent } from "@shared/design-system/dated-row/infrastructure/components/dated-row.component";
import { DatedRowTone } from "@shared/design-system/dated-row/domain/models/dated-row-tone.enum";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { GetInventoriesService } from "@nutrition/pantry/inventory/application/services/get-inventories.service";
import { InventoryViewService } from "@nutrition/pantry/inventory/application/services/inventory-view.service";
import { Inventory } from "../../domain/models/inventory.model";
import { InventoryRow } from "../../domain/models/inventory-row.model";
import { InventoryHero } from "../../domain/models/inventory-hero.model";
import { InventoryMonthGroup } from "../../domain/models/inventory-month-group.model";
import { InventoryQuickAccess } from "../../domain/models/inventory-quick-access.model";
import { InventoryStatus } from "../../domain/models/inventory-status.model";
import { StartInventoryFormComponent } from "./start-inventory-form.component";

import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";
@Component({
  selector: "app-get-inventories",
  templateUrl: "./get-inventories.component.html",
  imports: [
    NgTemplateOutlet,
    RevealDirective,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    GridComponent,
    HeadingComponent,
    TextComponent,
    ChipComponent,
    ButtonComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    InfiniteScrollComponent,
    SplitViewComponent,
    ModuleCardComponent,
    ProgressRingComponent,
    StatStripComponent,
    ActionTileComponent,
    SectionHeaderComponent,
    DatedRowComponent,
    SkeletonComponent,
    ModalSheetComponent,
    StartInventoryFormComponent,
  ],
})
export class GetInventoriesComponent extends AbstractListPageComponent<Inventory> {
  private backNavigation = inject(BackNavigationService);
  private static readonly PAGE_SIZE = 20;

  private getInventoriesService = inject(GetInventoriesService);
  private inventoryView = inject(InventoryViewService);

  protected readonly modulePath = "nutrition/pantry/inventory";
  protected readonly storageKey = "pageSize_inventories";
  protected override readonly appendsPages = true;

  start = input(false, { transform: booleanAttribute });

  loadingMore = signal(false);
  startOpen = signal(false);

  private readonly today = new Date();

  hasMore = computed(() => this.items().length < this.totalItems());

  headerSubtitle = computed(() =>
    this.translate("getInventories.stats.counts", {
      count: this.totalItems(),
    }),
  );

  latest = computed<Inventory | null>(() => this.items()[0] ?? null);

  hero = computed<InventoryHero | null>(() => {
    const latest = this.latest();

    if (!latest) return null;

    const attributes = latest.attributes;
    const locale = this.translationService.getLocale();

    return {
      title: this.inventoryView.longDateLabel(attributes.countedOn, locale),
      caption: `${this.t(this.inventoryView.shiftKey(attributes.shift))} · ${this.inventoryView.relativeDayLabel(attributes.countedOn, locale, this.today)}`,
      statusLabel: this.t(this.inventoryView.statusKey(attributes.status)),
      validated: InventoryStatus.VALIDATED === attributes.status,
      percent: this.inventoryView.progressPercent(
        attributes.countedItems,
        attributes.totalItems,
      ),
      stats: [
        {
          value: `${attributes.countedItems}/${attributes.totalItems}`,
          label: this.t("getInventories.hero.counted"),
        },
        {
          value: `${attributes.adjustedItems}`,
          label: this.t("getInventories.hero.adjusted"),
        },
        {
          value: `${attributes.totalLocations}`,
          label: this.t("getInventories.hero.locations"),
        },
      ],
    };
  });

  tiles = computed<InventoryQuickAccess>(() => ({
    locations: this.t("getInventories.tiles.locations"),
    locationsMeta: this.t("getInventories.tiles.locationsMeta"),
    tickets: this.t("getInventories.tiles.tickets"),
    ticketsMeta: this.t("getInventories.tiles.ticketsMeta"),
    catalog: this.t("getInventories.tiles.catalog"),
    catalogMeta: this.t("getInventories.tiles.catalogMeta"),
  }));

  months = computed<InventoryMonthGroup[]>(() => {
    const locale = this.translationService.getLocale();

    return this.items()
      .reduce<{ key: string; countedOn: string; inventories: Inventory[] }[]>(
        (groups, inventory) => {
          const key = this.inventoryView.monthKey(
            inventory.attributes.countedOn,
          );
          const last = groups[groups.length - 1];

          if (last?.key === key) {
            last.inventories.push(inventory);
            return groups;
          }

          return [
            ...groups,
            {
              key,
              countedOn: inventory.attributes.countedOn,
              inventories: [inventory],
            },
          ];
        },
        [],
      )
      .map((group) => ({
        key: group.key,
        title: this.inventoryView.monthTitle(group.countedOn, locale),
        countLabel: this.translate("getInventories.stats.counts", {
          count: group.inventories.length,
        }),
        rows: group.inventories.map((inventory) =>
          this.toRow(inventory, locale),
        ),
      }));
  });

  constructor() {
    super();

    toObservable(this.start)
      .pipe(filter(Boolean), takeUntilDestroyed())
      .subscribe(() => this.openStartFromUrl());
  }

  protected configureList(): void {
    this.currentPage.set(1);
    this.pageSize.set(GetInventoriesComponent.PAGE_SIZE);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Inventory>> {
    return this.getInventoriesService.getInventories(page, pageSize);
  }

  loadMore(): void {
    if (this.loading() || this.loadingMore() || !this.hasMore()) return;

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

  onStart(): void {
    this.startOpen.set(true);
  }

  private openStartFromUrl(): void {
    this.startOpen.set(true);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { start: null },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }

  onCloseStart(): void {
    this.startOpen.set(false);
  }

  onStarted(id: string | null): void {
    this.startOpen.set(false);

    if (!id) {
      this.load();
      return;
    }

    this.onOpen(id);
  }

  onOpen(id: string): void {
    this.router.navigate(["/inventory", id]);
  }

  onLocations(): void {
    this.router.navigate(["/locations"]);
  }

  onTickets(): void {
    this.router.navigate(["/tickets"]);
  }

  onCatalog(): void {
    this.router.navigate(["/catalog"]);
  }

  private toRow(inventory: Inventory, locale: string): InventoryRow {
    const attributes = inventory.attributes;
    const shiftLabel = this.t(this.inventoryView.shiftKey(attributes.shift));
    const validated = InventoryStatus.VALIDATED === attributes.status;

    return {
      id: inventory.id,
      weekday: this.inventoryView.weekdayLabel(attributes.countedOn, locale),
      day: `${this.inventoryView.countedDate(attributes.countedOn).getDate()}`,
      title: `${shiftLabel} · ${this.translate("getInventories.card.locations", { count: attributes.totalLocations })}`,
      meta: `${this.translate("getInventories.card.counted", {
        counted: attributes.countedItems,
        total: attributes.totalItems,
      })} · ${this.translate("getInventories.card.adjusted", {
        count: attributes.adjustedItems,
      })}`,
      tag: this.t(this.inventoryView.statusKey(attributes.status)),
      tagTone: validated ? DatedRowTone.Success : DatedRowTone.Warning,
      progress: this.inventoryView.progressPercent(
        attributes.countedItems,
        attributes.totalItems,
      ),
      ariaLabel: this.translate("getInventories.row.open", {
        date: this.inventoryView.longDateLabel(attributes.countedOn, locale),
      }),
    };
  }

  private translate(key: string, params: Record<string, unknown>): string {
    return this.translationService.translate(key, this.modulePath, params);
  }

  goBack(): void {
    this.backNavigation.back(["/kitchen"]);
  }
}
