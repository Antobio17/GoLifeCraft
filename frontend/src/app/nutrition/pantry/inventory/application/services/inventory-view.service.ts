import { Injectable, inject } from "@angular/core";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { AggregateNavigationService } from "@shared/routing/application/services/aggregate-navigation.service";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import { PantryLocationKindCatalogService } from "@nutrition/pantry/location/application/services/pantry-location-kind-catalog.service";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { InventoryLocation } from "../../domain/models/inventory-location.model";
import { InventoryLocationItem } from "../../domain/models/inventory-location-item.model";
import { InventoryLocationRow } from "../../domain/models/inventory-location-row.model";
import { InventoryItemRow } from "../../domain/models/inventory-item-row.model";
import { InventoryItemUnit } from "../../domain/models/inventory-item-unit.model";
import { InventoryShift } from "../../domain/models/inventory-shift.model";

const MILLISECONDS_PER_DAY = 86_400_000;

@Injectable({ providedIn: "root" })
export class InventoryViewService {
  private entityVisual = inject(EntityVisualService);
  private aggregateNavigation = inject(AggregateNavigationService);
  private unitCatalog = inject(UnitCatalogService);
  private kindCatalog = inject(PantryLocationKindCatalogService);

  shiftKey(shift: InventoryShift | string): string {
    return `inventoryShift.${shift}`;
  }

  statusKey(status: string): string {
    return `inventoryStatus.${status}`;
  }

  dateLabel(countedOn: string): string {
    const [year, month, day] = countedOn.slice(0, 10).split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) return countedOn;

    return date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  countedDate(countedOn: string): Date {
    const [year, month, day] = countedOn.slice(0, 10).split("-").map(Number);

    return new Date(year, month - 1, day);
  }

  monthKey(countedOn: string): string {
    return countedOn.slice(0, 7);
  }

  monthTitle(countedOn: string, locale: string): string {
    return this.capitalize(
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(this.countedDate(countedOn)),
    );
  }

  weekdayLabel(countedOn: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, { weekday: "short" })
      .format(this.countedDate(countedOn))
      .replace(".", "");
  }

  longDateLabel(countedOn: string, locale: string): string {
    return this.capitalize(
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(this.countedDate(countedOn)),
    );
  }

  relativeDayLabel(countedOn: string, locale: string, today: Date): string {
    const midnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const days = Math.round(
      (this.countedDate(countedOn).getTime() - midnight.getTime()) /
        MILLISECONDS_PER_DAY,
    );

    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      days,
      "day",
    );
  }

  progressPercent(counted: number, total: number): number {
    if (total <= 0) return 0;

    return Math.round((counted / total) * 100);
  }

  locationRowOf(
    location: InventoryLocation,
    t: (key: string) => string,
  ): InventoryLocationRow {
    return {
      location,
      ...this.kindCatalog.visualOf(location.emoji),
      name: location.name,
      description: this.locationDescription(location, t),
      badges: [
        {
          label: `${location.countedItems}/${location.totalItems}`,
          value: t("getInventory.location.counted"),
        },
        {
          label: `${location.adjustedItems}`,
          value: t("getInventory.location.adjusted"),
        },
      ],
    };
  }

  rowOf(
    item: InventoryLocationItem,
    unit: string,
    t: (key: string) => string,
  ): InventoryItemRow {
    const selected = this.unitOf(item, unit);
    const counted = null !== item.countedQuantity;

    return {
      item,
      emoji: item.emoji,
      name: item.name,
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Pantry,
        this.entityVisual.kindOf(item.kind),
        item.refId,
        item.image,
      ),
      favorite: item.favorite,
      quantity: this.inUnit(
        item.countedQuantity ?? item.expectedQuantity,
        selected,
      ),
      unit: selected.unit,
      unitLabel: this.unitLabel(selected.unit),
      unitOptions: this.unitOptions(item),
      countedLabel: counted
        ? `${this.format(this.inUnit(item.countedQuantity ?? 0, selected))} ${this.unitLabel(selected.unit)}`
        : t("getInventory.notCounted"),
      counted,
      openable: this.aggregateNavigation.canOpen(item.kind, item.refId),
    };
  }

  selectedUnit(item: InventoryLocationItem): string {
    return item.countedUnit ?? item.storageUnit ?? item.unit;
  }

  format(quantity: number): string {
    return Number.isInteger(quantity)
      ? quantity.toString()
      : quantity.toFixed(2).replace(/0$/, "");
  }

  private unitOptions(item: InventoryLocationItem): SelectOption[] {
    return item.units.map((unit) => ({
      value: unit.unit,
      label: this.unitLabel(unit.unit),
    }));
  }

  private unitOf(item: InventoryLocationItem, unit: string): InventoryItemUnit {
    return (
      item.units.find((candidate) => candidate.unit === unit) ?? {
        unit: item.unit,
        factor: 1,
      }
    );
  }

  private unitLabel(unit: string): string {
    return this.unitCatalog.label(unit);
  }

  private inUnit(quantity: number, unit: InventoryItemUnit): number {
    if (unit.factor <= 0) return quantity;

    return Math.round((quantity / unit.factor) * 100) / 100;
  }

  private locationDescription(
    location: InventoryLocation,
    t: (key: string) => string,
  ): string {
    const items = this.fill(t("getInventory.location.items"), {
      count: String(location.totalItems),
    });

    if (null !== location.locationId) return items;

    return `${t("getInventory.locationGone")} · ${items}`;
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private fill(text: string, replacements: Record<string, string>): string {
    return Object.entries(replacements).reduce(
      (filled, [token, value]) => filled.replace(`{${token}}`, value),
      text,
    );
  }
}
