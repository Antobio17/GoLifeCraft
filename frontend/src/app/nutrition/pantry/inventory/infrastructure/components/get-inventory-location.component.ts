import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { toObservable, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { switchMap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { MacroBadgesComponent } from "@shared/design-system/macro-badges/infrastructure/components/macro-badges.component";
import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";
import { ProgressBarComponent } from "@shared/design-system/progress-bar/infrastructure/components/progress-bar.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { InlineQuantityComponent } from "@shared/design-system/inline-quantity/infrastructure/components/inline-quantity.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { GetInventoryService } from "@nutrition/pantry/inventory/application/services/get-inventory.service";
import { CountInventoryItemService } from "@nutrition/pantry/inventory/application/services/count-inventory-item.service";
import { InventoryViewService } from "@nutrition/pantry/inventory/application/services/inventory-view.service";
import { InventoryDetailAttributes } from "../../domain/models/inventory-detail-attributes.model";
import { InventoryLocation } from "../../domain/models/inventory-location.model";
import { InventoryItemRow } from "../../domain/models/inventory-item-row.model";
import { InventoryStatus } from "../../domain/models/inventory-status.model";

@Component({
  selector: "app-get-inventory-location",
  templateUrl: "./get-inventory-location.component.html",
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    SplitViewComponent,
    StackComponent,
    CardComponent,
    TextComponent,
    MacroBadgesComponent,
    ProgressBarComponent,
    EmojiTileComponent,
    InlineQuantityComponent,
    IconButtonComponent,
    EmptyStateComponent,
    SkeletonComponent,
    SkeletonScreenHeaderComponent,
    SectionHeaderComponent,
  ],
})
export class GetInventoryLocationComponent {
  private translationService = inject(TranslationService);
  private getInventoryService = inject(GetInventoryService);
  private countInventoryItemService = inject(CountInventoryItemService);
  private inventoryView = inject(InventoryViewService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/pantry/inventory";

  readonly id = input.required<string>();
  readonly locationId = input.required<string>();

  attributes = signal<InventoryDetailAttributes | null>(null);
  unitByItem = signal<Record<string, string>>({});
  loading = signal(true);

  isDraft = computed(() => InventoryStatus.DRAFT === this.attributes()?.status);

  location = computed<InventoryLocation | null>(
    () =>
      (this.attributes()?.locations ?? []).find(
        (location) => location.id === this.locationId(),
      ) ?? null,
  );

  eyebrow = computed(() => {
    const attributes = this.attributes();

    if (null === attributes) return "";

    return this.inventoryView.dateLabel(attributes.countedOn);
  });

  headerSubtitle = computed(() => {
    const location = this.location();

    if (null === location) return "";

    const counted = this.t("getInventoryLocation.counted")
      .replace("{counted}", String(location.countedItems))
      .replace("{total}", String(location.totalItems));

    if (null !== location.locationId) return counted;

    return `${this.t("getInventory.locationGone")} · ${counted}`;
  });

  summaryBadges = computed<MacroBadge[]>(() => {
    const location = this.location();

    if (null === location) return [];

    return [
      {
        label: `${location.countedItems}/${location.totalItems}`,
        value: this.t("getInventory.location.counted"),
      },
      {
        label: `${location.adjustedItems}`,
        value: this.t("getInventory.location.adjusted"),
      },
    ];
  });

  progressPercent = computed(() => {
    const location = this.location();

    if (null === location || 0 === location.totalItems) return 0;

    return Math.round((location.countedItems / location.totalItems) * 100);
  });

  hint = computed(() =>
    this.isDraft()
      ? this.t("getInventoryLocation.hint")
      : this.t("getInventory.validatedHint"),
  );

  rows = computed<InventoryItemRow[]>(() => {
    const units = this.unitByItem();

    return (this.location()?.items ?? []).map((item) =>
      this.inventoryView.rowOf(
        item,
        units[item.id] ?? this.inventoryView.selectedUnit(item),
        (key) => this.t(key),
      ),
    );
  });

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((inventoryId) => {
          this.loading.set(true);

          return this.getInventoryService.getInventory(inventoryId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.translationService
            .loadModuleTranslations(this.MODULE_PATH)
            .then(() => {
              this.attributes.set(response.data.attributes);
              this.loading.set(false);
            });
        },
        error: () => this.loading.set(false),
      });
  }

  protected t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  onQuantity(row: InventoryItemRow, quantity: number): void {
    this.save(row, quantity);
  }

  onUnit(row: InventoryItemRow, unit: string): void {
    this.unitByItem.update((units) => ({ ...units, [row.item.id]: unit }));
  }

  onConfirm(row: InventoryItemRow): void {
    this.save(row, row.quantity);
  }

  onClear(row: InventoryItemRow): void {
    this.save(row, null);
  }

  back(): void {
    this.router.navigate(["/inventory", this.id()]);
  }

  private save(row: InventoryItemRow, countedQuantity: number | null): void {
    this.countInventoryItemService
      .countInventoryItem(this.id(), row.item.id, {
        countedQuantity,
        countedUnit: null === countedQuantity ? null : row.unit,
      })
      .subscribe({
        next: () => this.refresh(),
      });
  }

  private refresh(): void {
    this.getInventoryService.getInventory(this.id()).subscribe({
      next: (response) => this.attributes.set(response.data.attributes),
    });
  }
}
